package br.com.mmgabri.services;

import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadLocalRandom;

@Service
public class NumberGeneratorService {

    private static final int FNV_32_OFFSET_BASIS = 0x811C9DC5;
    private static final int FNV_32_PRIME = 0x01000193;
    private static final String PREFIX_5_DIGITS = "M";

    public String generate(String mti, String de2, String de11, String de7, int digits) {
        int modulus = pow10(digits);

        int number;
        if (isAnyBlank(mti, de2, de11, de7)) {
            number = ThreadLocalRandom.current().nextInt(modulus);
        } else {
            int hash = FNV_32_OFFSET_BASIS;
            hash = updateHash(hash, mti);
            hash = updateHash(hash, "|");
            hash = updateHash(hash, de2);
            hash = updateHash(hash, "|");
            hash = updateHash(hash, de11);
            hash = updateHash(hash, "|");
            hash = updateHash(hash, de7);
            number = Math.floorMod(hash, modulus);
        }

        String formatted = padLeft(number, digits);
        return digits == 5 ? PREFIX_5_DIGITS + formatted : formatted;
    }

    private boolean isAnyBlank(String... values) {
        for (String v : values) {
            if (v == null || v.isBlank()) return true;
        }
        return false;
    }

    private int updateHash(int currentHash, String value) {
        int hash = currentHash;
        for (int i = 0; i < value.length(); i++) {
            hash ^= value.charAt(i);
            hash *= FNV_32_PRIME;
        }
        return hash;
    }

    private String padLeft(int value, int length) {
        char[] digits = new char[length];
        int current = value;
        for (int i = length - 1; i >= 0; i--) {
            digits[i] = (char) ('0' + (current % 10));
            current /= 10;
        }
        return new String(digits);
    }

    private int pow10(int exp) {
        int result = 1;
        for (int i = 0; i < exp; i++) result *= 10;
        return result;
    }
}

