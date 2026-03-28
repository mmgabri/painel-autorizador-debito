package br.com.mmgabri.adapters.csv;

import br.com.mmgabri.domains.DispatcherEventoCsvRow;

import java.util.List;

public interface DispatcherEventoCsvAdapter {

    void append(DispatcherEventoCsvRow evento);

    void replaceAll(List<DispatcherEventoCsvRow> eventos);

    List<DispatcherEventoCsvRow> findAll();
}
