export async function GET(
  req: Request,
  context: { params: Record<string, string> }
): Promise<Response> {
  const { userid } = context.params;
  return Response.json({ userID: userid });
}