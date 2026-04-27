import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
<<<<<<< HEAD

=======
>>>>>>> f04e20575b112f284b1efdeb812b6cc0d0fbd454
export { handler as GET, handler as POST };
