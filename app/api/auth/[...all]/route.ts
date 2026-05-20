import { auth } from "@/lib/auth"

type Handler = (request: Request) => Response | Promise<Response>

export const GET: Handler = async (request) => auth.handler(request)
export const POST: Handler = async (request) => auth.handler(request)
export const PUT: Handler = async (request) => auth.handler(request)
export const DELETE: Handler = async (request) => auth.handler(request)
export const PATCH: Handler = async (request) => auth.handler(request)