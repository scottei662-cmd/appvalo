import { z } from "zod/v4";

const weaponCategoryEnum = z.enum(["Sidearm", "SMG", "Shotgun", "Rifle", "Sniper", "Heavy", "Melee"]);

export const createWeaponSchema = z.object({
    name: z.string(),
    image: z.string(),
    category: weaponCategoryEnum,
});

export const updateWeaponSchema = z.object({
    name: z.string().optional(),
    image: z.string().optional(),
    category: weaponCategoryEnum.optional(),
});

export type CreateWeaponDto = z.infer<typeof createWeaponSchema>;
export type UpdateWeaponDto = z.infer<typeof updateWeaponSchema>;
