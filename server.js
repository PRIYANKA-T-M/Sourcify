// Get nearby vendors
app.get('/api/vendors/nearby', (req, res) => {
  const { lat, lng } = req.query;
  // Query database for vendors near [lat, lng]
  res.json([{ id: 123, name: "My Street Food Stall", distance: "1.2" }]);
});

// Get vendor details
app.get('/api/vendors/:id', (req, res) => {
  // Return shop description, location (approximate until accepted), etc.
  res.json({
    id: 123,
    name: "My Street Food Stall",
    description: "Family-run stall for 10 years...",
    location: "123 Market Street (exact after acceptance)"
  });
});

// Send collaboration invite
app.post('/api/collaborations/invite', (req, res) => {
  // Save invite to database
  // Notify recipient via WebSocket/email
  res.sendStatus(200);
});