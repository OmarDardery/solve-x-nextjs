import prisma from "@/lib/prisma";

/**
 * Create coins record for a student (internal use, called when creating student)
 */
export async function createCoins(studentId: number) {
  return prisma.coins.create({
    data: {
      amount: 0,
      studentId,
    },
  });
}

/**
 * Get coins by student ID
 */
export async function getCoinsByStudentId(studentId: number) {
  const coins = await prisma.coins.findUnique({
    where: { studentId },
  });

  if (!coins) {
    throw new Error("Coins record not found");
  }

  return coins;
}

/**
 * Increment student's coins
 */
export async function incrementCoins(studentId: number, amount: number) {
  const coins = await prisma.coins.update({
    where: { studentId },
    data: {
      amount: {
        increment: amount,
      },
    },
  });

  return coins;
}

/**
 * Decrement student's coins (with validation)
 */
export async function decrementCoins(studentId: number, amount: number) {
  // Get current coins first
  const current = await getCoinsByStudentId(studentId);

  if (current.amount < amount) {
    throw new Error("Insufficient coins");
  }

  const coins = await prisma.coins.update({
    where: { studentId },
    data: {
      amount: {
        decrement: amount,
      },
    },
  });

  return coins;
}
