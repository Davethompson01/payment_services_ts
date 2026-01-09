import Database from "./database_connect";
async function testDBConnection() {
  try {
    const db = Database.getInstance();
    const connection = await db.connect();

    await connection.ping();

    console.log("atabase connection successful");

    await connection.end();
  } catch (error) {
    console.error(" Database connection failed");
    console.error(error);
  }
}
testDBConnection();

export default testDBConnection;
