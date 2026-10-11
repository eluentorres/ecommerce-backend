import AdminLog from "../models/AdminLog.js";

export async function registerAdminAction({
  adminId,
  action,
  targetId,
  details
}) {
  try {
    await AdminLog.create({
      adminId,
      action,
      targetId,
      details
    });

    console.log(`Acción administrativa registrada: ${action}`);
  } catch (error) {
    console.error("Error al registrar acción administrativa:", error.message);
  }
}
