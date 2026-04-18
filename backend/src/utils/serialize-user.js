const serializeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  city: user.city,
  bio: user.bio,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

module.exports = serializeUser;
