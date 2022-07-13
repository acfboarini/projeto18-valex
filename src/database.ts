import dotenv from "dotenv";
import pg from "pg";
dotenv.config();

/*const { Pool } = pg;
export const connection = new Pool({
  connectionString: process.env.DATABASE_URL,
});*/

const { Pool } = pg;
const configDatabase = {
  connectionString: process.env.DATABASE_URL
};

/*if(process.env.MODE === "PROD") {
  configDatabase.ssl = {
    rejectUnauthorized: false
  }
}*/

const connection = new Pool(configDatabase);
export default connection;