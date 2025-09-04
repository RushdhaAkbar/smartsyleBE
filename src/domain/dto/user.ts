import { z } from "zod";

export const UserDTO = z.object({
   name: z.string(),
  email: z.string().email(),
  phone: z.string(),
});