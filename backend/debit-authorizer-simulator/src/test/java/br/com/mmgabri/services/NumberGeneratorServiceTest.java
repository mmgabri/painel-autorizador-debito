package br.com.mmgabri.services;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class NumberGeneratorServiceTest {

    private final NumberGeneratorService service = new NumberGeneratorService();

    @Test
    void shouldGenerateDeterministicNumberWithAllFieldsPresent() {
        String first  = service.generate("0100", "5320010007044630", "123456", "0322143045", 5);
        String second = service.generate("0100", "5320010007044630", "123456", "0322143045", 5);

        assertEquals(first, second);
        assertTrue(first.startsWith("M"));
        assertEquals(6, first.length()); // "M" + 5 digits
        assertTrue(first.substring(1).chars().allMatch(Character::isDigit));
    }

    @Test
    void shouldPrefixMOnlyWhenDigitsIs5() {
        String result4 = service.generate("0100", "5320010007044630", "123456", "0322143045", 4);
        String result5 = service.generate("0100", "5320010007044630", "123456", "0322143045", 5);
        String result6 = service.generate("0100", "5320010007044630", "123456", "0322143045", 6);

        assertFalse(result4.startsWith("M"));
        assertEquals(4, result4.length());

        assertTrue(result5.startsWith("M"));
        assertEquals(6, result5.length()); // M + 5 digits

        assertFalse(result6.startsWith("M"));
        assertEquals(6, result6.length());
    }

    @Test
    void shouldGenerateDifferentNumbersWhenInputChanges() {
        String base        = service.generate("0100", "5320010007044630", "123456", "0322143045", 5);
        String changedMti  = service.generate("0200", "5320010007044630", "123456", "0322143045", 5);
        String changedDe2  = service.generate("0100", "5320010007044631", "123456", "0322143045", 5);
        String changedDe11 = service.generate("0100", "5320010007044630", "123457", "0322143045", 5);
        String changedDe7  = service.generate("0100", "5320010007044630", "123456", "0322143046", 5);

        assertNotEquals(base, changedMti);
        assertNotEquals(base, changedDe2);
        assertNotEquals(base, changedDe11);
        assertNotEquals(base, changedDe7);
    }

    @Test
    void shouldGenerateRandomNumberWhenAnyFieldIsNull() {
        String result = service.generate(null, "5320010007044630", "123456", "0322143045", 5);

        assertTrue(result.startsWith("M"));
        assertEquals(6, result.length());
        assertTrue(result.substring(1).chars().allMatch(Character::isDigit));
    }

    @Test
    void shouldGenerateRandomNumberWhenAnyFieldIsBlank() {
        String result = service.generate("0100", "", "123456", "0322143045", 5);

        assertTrue(result.startsWith("M"));
        assertEquals(6, result.length());
        assertTrue(result.substring(1).chars().allMatch(Character::isDigit));
    }

    @Test
    void shouldGenerateRandomNumberWhenAllFieldsAreNull() {
        String result = service.generate(null, null, null, null, 5);

        assertTrue(result.startsWith("M"));
        assertEquals(6, result.length());
        assertTrue(result.substring(1).chars().allMatch(Character::isDigit));
    }

    @Test
    void shouldRespectDigitsCountForDifferentLengths() {
        String r3 = service.generate("0100", "5320010007044630", "123456", "0322143045", 3);
        String r8 = service.generate("0100", "5320010007044630", "123456", "0322143045", 8);

        assertEquals(3, r3.length());
        assertTrue(r3.chars().allMatch(Character::isDigit));

        assertEquals(8, r8.length());
        assertTrue(r8.chars().allMatch(Character::isDigit));
    }
}

