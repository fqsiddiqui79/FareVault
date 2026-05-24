export const healthCheck = (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'farevault-backend',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};
