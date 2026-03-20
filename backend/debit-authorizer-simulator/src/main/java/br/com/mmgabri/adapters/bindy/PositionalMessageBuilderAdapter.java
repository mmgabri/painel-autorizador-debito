package br.com.mmgabri.adapters.bindy;

import java.util.Map;

public interface PositionalMessageBuilderAdapter {

    String build(Map<String, String> fields, String mti);
}

