const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config({
  path: path.join(__dirname, ".env")
});

console.log("Supabase URL loaded:", Boolean(process.env.SUPABASE_URL));
console.log("Supabase key loaded:", Boolean(process.env.SUPABASE_SECRET_KEY));

const app = express();

app.use(cors());
app.use(express.json());



const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);



// Test route
app.get("/", (req, res) => {
  res.send("Axl CRM Backend is running!");
});

// Get all lead
app.get("/api/leads", async (req, res) => {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("id", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Add a new lead
app.post("/api/leads", async (req, res) => {
  const { name, email, phone, business, status } = req.body;

  if (!name || !email || !phone || !business || !status) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const { data, error } = await supabase
    .from("leads")
    .insert([{ name, email, phone, business, status }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json(data);
});

// Update a lead
app.put("/api/leads/:id", async (req, res) => {
  const { name, email, phone, business, status } = req.body;

  const { data, error } = await supabase
    .from("leads")
    .update({ name, email, phone, business, status })
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

// Delete a lead
app.delete("/api/leads/:id", async (req, res) => {
  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", req.params.id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "lead deleted successfully." });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Axl backend running on port ${PORT}`);
});
