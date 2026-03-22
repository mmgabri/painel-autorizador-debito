package br.com.mmgabri.adapters.jpos;

import br.com.mmgabri.domains.MessageBuildRequest;
import br.com.mmgabri.domains.enuns.MessageParseTypeEnum;

public interface IsoMessageBuilderAdapter {
    String execute(MessageBuildRequest request, MessageParseTypeEnum messageParseType);
}
