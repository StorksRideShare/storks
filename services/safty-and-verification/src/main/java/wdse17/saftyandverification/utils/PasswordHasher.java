package wdse17.saftyandverification.utils;
import org.mindrot.jbcrypt.BCrypt;

public class PasswordHasher {
    private static final int LOG_ROUNDS = 10;
    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(LOG_ROUNDS));
    }

    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {return false;}
        return BCrypt.checkpw(plainPassword, hashedPassword);
    }
}