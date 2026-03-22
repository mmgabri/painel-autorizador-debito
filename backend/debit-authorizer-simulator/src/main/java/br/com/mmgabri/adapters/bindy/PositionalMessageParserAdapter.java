package br.com.mmgabri.adapters.bindy;

import java.util.Map;

public interface PositionalMessageParserAdapter {

    Map<String, String> parse(String positionalMessage);
}

