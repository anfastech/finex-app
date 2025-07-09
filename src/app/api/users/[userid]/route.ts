export function GET(
    req: Request,
    { params }: { params: { userid: string } }
) {
    return Response.json({userID: params.userid});
}