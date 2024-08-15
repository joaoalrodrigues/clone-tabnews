import database from "../../../../infra/database.js";

async function status(_, response) {
  const result = await database.query("SELECT 1 + 1;");
  response.status(200).json({ sum: result.rows.column });
}

export default status;
