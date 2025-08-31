// app/api/cart/[action]/route.ts
import axios from "axios"
import { NextRequest, NextResponse } from "next/server"


export async function GET(req: NextRequest, { params }: { params: { action: string[] } }) {
  const endpoint = params.action.join("/")
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${endpoint}/`
  const res = await axios.get(url, {
    headers: { Cookie: req.headers.get("cookie") || "" },
  })
  return NextResponse.json(res.data)
}

export async function POST(req: NextRequest, { params }: { params: { action: string[] } }) {
  const endpoint = params.action.join("/")
  const data = await req.json()
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${endpoint}/`, data, {
    headers: { Cookie: req.headers.get("cookie") || "" },
  })
  return NextResponse.json(res.data)
}

export async function PUT(req: NextRequest, { params }: { params: { action: string[] } }) {
  const endpoint = params.action.join("/")
  const data = await req.json()
  const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/cart/${endpoint}/`, data, {
    headers: { Cookie: req.headers.get("cookie") || "" },
  })
  return NextResponse.json(res.data)
}

export async function DELETE(req: NextRequest, { params }: { params: { action: string[] } }) {
  const endpoint = params.action.join("/")
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cart/${endpoint}/`
  const res = await axios.delete(url, {
    headers: { Cookie: req.headers.get("cookie") || "" },
  })
  return NextResponse.json(res.data)
}

