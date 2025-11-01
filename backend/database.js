import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: "aaliyanavas",
  host: "localhost",
  database: "moodsic_db",
  port: 5432,
});

export default pool;
