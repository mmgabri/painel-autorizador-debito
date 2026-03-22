package br.com.mmgabri.adapters.jpos;

import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.MessageParseResponse;
import br.com.mmgabri.domains.enuns.MessageParseTypeEnum;

public interface IsoMessageParserAdapter {
    MessageParseResponse execute(String isoMessage, MessageParseTypeEnum messageParseType);
}
