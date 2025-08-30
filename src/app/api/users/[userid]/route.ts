// export function GET(
//     req: Request,
//     { params }: { params: { userId: string } }
// ) {
//     return Response.json({ userID: params.userId });
// }

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  return Response.json({ userId })
}