package br.com.mmgabri.domains;

import lombok.Data;
import org.apache.camel.dataformat.bindy.annotation.DataField;
import org.apache.camel.dataformat.bindy.annotation.FixedLengthRecord;

@Data
@FixedLengthRecord(ignoreMissingChars = false, ignoreTrailingChars = false, paddingChar = ' ')
public class PositionalMessageT464Record {

    @DataField(pos = 1, length = 4, trim = true)
    private String mti;

    @DataField(pos = 5, length = 10, trim = true)
    private String fakeAccount;

    @DataField(pos = 15, length = 6, trim = true)
    private String fakeProcessingCode;

    @DataField(pos = 21, length = 12, trim = true)
    private String fakeAmount;

    @DataField(pos = 33, length = 3, trim = true)
    private String fakeCurrency;

    @DataField(pos = 36, length = 20, trim = true)
    private String fakeMerchant;

    @DataField(pos = 56, length = 20, trim = true)
    private String fakeCity;

    @DataField(pos = 76, length = 675, trim = true)
    private String filler;
}

