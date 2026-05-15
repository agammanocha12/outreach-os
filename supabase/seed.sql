UPDATE settings SET
  full_name = 'Agam Manocha',
  business_name = 'Atlas Reception',
  phone = '347-715-8323',
  physical_address = '2 Notch Court, Dix Hills, NY 11746',
  gmail_address = 'atlasreception4you@gmail.com',
  send_rate = 40,
  monthly_price = 400,
  booking_link = 'https://calendly.com/atlasreception4you/new-meeting',
  niche = 'HVAC and plumbing',
  cities = ARRAY[
    'Suffolk County NY',
    'Nassau County NY',
    'Queens NY',
    'Dix Hills NY',
    'Plainview NY',
    'Levittown NY',
    'Long Island NY'
  ],
  value_prop = 'Unlike a human receptionist who costs $3,200+/month and only works 40 hours a week, our AI receptionist answers every call 24/7/365 for just $400/month so you never miss a lead, even at 2am on Christmas.',
  paused = TRUE
WHERE id = 1;
