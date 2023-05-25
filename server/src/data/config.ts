import dotenv from 'dotenv';
import path from 'path';
dotenv.config()


export const DIR = path.resolve()

export const PORT = process.env.PORT || 7000

// database
export const DB_NAME: string = process.env.DB_NAME || 'database'

export const DB_USER: string | undefined = process.env.DB_USER
export const DB_PASS: string | undefined = process.env.DB_PASS
export const DB_PORT: number | undefined = Number(process.env.DB_PORT)
export const DB_HOST: string | undefined = process.env.DB_HOST

export const LOGGING: boolean = process.env.LOGGING === 'true'

// redis
export const REDIS_URI: string = String(process.env.REDIS_URI)

// auth
export const JWT_ACCESS_SECRET: string = process.env.JWT_ACCESS_SECRET || 'secret_access_key'
export const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET || 'secret_refresh_key'
// Google oauth
export const GOOGLE_CLIENT_ID: string = String(process.env.GOOGLE_CLIENT_ID)
export const GOOGLE_CLIENT_SECRET: string = String(process.env.GOOGLE_CLIENT_SECRET)
export const GOOGLE_SCOPES: string[] = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]
export const GOOGLE_AUTH_URI: string = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URI: string = 'https://oauth2.googleapis.com/token';
export const GOOGLE_REDIRECT_URI: string = 'http://localhost:4000/api/auth/google';
export const GOOGLE_USER_INFO_URI: string = 'https://www.googleapis.com/oauth2/v2/userinfo';
// GitHub oauth
export const GITHUB_CLIENT_ID: string = String(process.env.GITHUB_CLIENT_ID)
export const GITHUB_CLIENT_SECRET: string = String(process.env.GITHUB_CLIENT_SECRET)
export const GITHUB_SCOPES: string[] = [
    'user:email'
]
export const GITHUB_AUTH_URI: string = 'https://github.com/login/oauth/authorize'
export const GITHUB_TOKEN_URI: string = 'https://github.com/login/oauth/access_token';
export const GITHUB_REDIRECT_URI: string = 'http://localhost:4000/api/auth/github'
export const GITHUB_USER_INFO_URI: string = 'https://api.github.com/user'
