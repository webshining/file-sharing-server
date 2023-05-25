import { Request, Response } from "express";
import {
	GITHUB_AUTH_URI,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GITHUB_REDIRECT_URI,
	GITHUB_SCOPES,
	GITHUB_TOKEN_URI,
	GITHUB_USER_INFO_URI,
	GOOGLE_AUTH_URI,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI,
	GOOGLE_SCOPES,
	GOOGLE_USER_INFO_URI
} from "../data/config";
import { LoginUserDto, RegisterUserDto } from "../dto/user.dto";
import { User } from "../models/user.entity";
import AuthService from "../services/auth.service";
import ModelService from "../services/model.service";
import { GOOGLE_TOKEN_URI } from "./../data/config";

class AuthController {
	private readonly userService = new ModelService<User>(User);
	private readonly authService = new AuthService();

	google = async (req: Request<{}, {}, {}, { code?: string }>, res: Response) => {
		const { code } = req.query;
		if (code) {
			const { id_token, access_token: googleAccessToken }: any = await (
				await fetch(GOOGLE_TOKEN_URI, {
					method: "post",
					body: JSON.stringify({
						client_id: GOOGLE_CLIENT_ID,
						client_secret: GOOGLE_CLIENT_SECRET,
						redirect_uri: GOOGLE_REDIRECT_URI,
						grant_type: "authorization_code",
						code,
					}),
				})
			).json();
			const { email, name } = await (
				await fetch(GOOGLE_USER_INFO_URI + `?access_token=${googleAccessToken}`, {
					method: "get",
					headers: { Authorization: `Bearer ${id_token}` },
				})
			).json();
			if(email && name) {
				const user = await this.userService.getOrCreate(
					{ email, google: true },
					{ name, email, google: true },
					["email"]
				);
				const {accessToken, refreshToken} = await this.authService.generateTokens({user: user.id}, {user: user.id})
				return res.cookie('refreshToken', refreshToken, {maxAge: 24*60*60*1000, httpOnly: true, secure: true}).json({ user, accessToken });
			} else {
				return res.json({error: "Auth error"})
			}
		} else {
			const stringifiedParams = new URLSearchParams({
				client_id: GOOGLE_CLIENT_ID,
				redirect_uri: GOOGLE_REDIRECT_URI,
				scope: GOOGLE_SCOPES.join(" "),
				response_type: "code",
				access_type: "offline",
				prompt: "consent",
			});
			const googleLoginUrl = `${GOOGLE_AUTH_URI}?${stringifiedParams}`;
			return res.redirect(googleLoginUrl);
		}
	};

	github = async (req: Request<{}, {}, {}, { code?: string }>, res: Response) => {
		const { code } = req.query;
		if (code) {
			const stringifiedParams = new URLSearchParams({
				client_id: GITHUB_CLIENT_ID,
				client_secret: GITHUB_CLIENT_SECRET,
				redirect_uri: GITHUB_REDIRECT_URI,
				code,
			});
			const { access_token } = await (
				await fetch(`${GITHUB_TOKEN_URI}?${stringifiedParams}`, {
					method: "post",
					headers: { Accept: "application/json" },
				})
			).json();
			const {id: github_id, name} = await (
				await fetch(GITHUB_USER_INFO_URI, {
					method: "get",
					headers: { Authorization: `Bearer ${access_token}` },
				})
			).json();
			if(github_id && name) {
				const user = await this.userService.getOrCreate(
					{ github_id },
					{ name, github_id },
					["github_id"]
				);
				const {accessToken, refreshToken} = await this.authService.generateTokens({user: user.id}, {user: user.id})
				return res.cookie('refreshToken', refreshToken, {maxAge: 24*60*60*1000, httpOnly: true, secure: true}).json({ user, accessToken });
			} else {
				return res.json({error: "Auth error"})
			}
		} else {
			const stringifiedParams = new URLSearchParams({
				client_id: GITHUB_CLIENT_ID,
				redirect_uri: GITHUB_REDIRECT_URI,
				scope: GITHUB_SCOPES.join(' ')
			});
			return res.redirect(`${GITHUB_AUTH_URI}?${stringifiedParams}`);
		}
	};

	register = async (req: Request<{}, {}, RegisterUserDto>, res: Response) => {
		const {email, name, password} = req.body
		const candidate = await this.userService.getOne({email})
		if(candidate)
			return res.json({error: "User already exists"})
			const hashPass = await this.authService.hashPass(password)
		const user = await this.userService.create({email, name, password: hashPass})
		const {accessToken, refreshToken} = await this.authService.generateTokens({user: user.id}, {user: user.id})
		return res.cookie('refreshToken', refreshToken, {maxAge: 24*60*60*1000, httpOnly: true, secure: true}).json({ user, accessToken });
	}

	login = async (req: Request<{}, {}, LoginUserDto>, res: Response) => {
		const {email, password} = req.body
		const user = await this.userService.getOne({email})
		if(!user || !user.password)
			return res.json({error: "User is not found"})
		const comparePass = await this.authService.comparePass(password, user.password)
		if(!comparePass)
			return res.json({error: "Incorrect password"})
		const {accessToken, refreshToken} = await this.authService.generateTokens({user: user.id}, {user: user.id})
		return res.cookie('refreshToken', refreshToken, {maxAge: 24*60*60*1000, httpOnly: true, secure: true}).json({ user, accessToken });
	}

	refresh = async (req: Request, res: Response) => {
		return res.json("Ok")
	}

	logout = async (req: Request, res: Response) => {
		return res.clearCookie('refreshToken', {secure: true, httpOnly: true}).json({message: "Success"})
	}
}

export default new AuthController();
