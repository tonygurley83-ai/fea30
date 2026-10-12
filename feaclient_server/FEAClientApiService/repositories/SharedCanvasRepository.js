async countSharedCanvases(
  userId
) {

  const result =
    await db.query(
      `
      SELECT COUNT(*)
      FROM canvas_shares
      WHERE user_id = $1
      `,
      [userId]
    );

  return Number(
    result.rows[0].count
  );

}
