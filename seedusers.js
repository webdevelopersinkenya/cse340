// seedUsers.js
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const pool = new Pool({
  user: 'gab340',
  host: 'dpg-d0isii95pdvs739qvgg0-a.oregon-postgres.render.com',
  database: 'gab340',
  password: 'iVe7yHlorfxeeVQURZTamGIwvobeCK89',
  port: 5432,
  ssl: { rejectUnauthorized: false },
});

async function seedUsers() {
  const users = [
    {
      email: "basic@340.edu",
      password: "I@mABas1cCl!3nt",
      role: "Client",
    },
    {
      email: "happy@340.edu",
      password: "I@mAnEmpl0y33",
      role: "Employee",
    },
    {
      email: "manager@340.edu",
      password: "I@mAnAdm!n1strat0r",
      role: "Manager",
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await pool.query(
      `INSERT INTO users (email, password, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET password = $2, role = $3`,
      [user.email, hashedPassword, user.role]
    );
  }

  console.log(" User accounts seeded with updated passwords.");
  await pool.end();
}

seedUsers().catch(console.error);
