# ── Keyspace ────────────────────────────────────────────────────────────────

resource "aws_keyspaces_keyspace" "presente" {
  name = "presentekeyspaces"

  tags = {
    Project = "painel-autorizador-debito"
  }
}

# ── tbx0247_ctrl_cadl_cont ──────────────────────────────────────────────────
# PK composta: agencia, codbanco, conta, dac10, num_titr_cont, tpempres

resource "aws_keyspaces_table" "tbx0247_ctrl_cadl_cont" {
  keyspace_name = aws_keyspaces_keyspace.presente.name
  table_name    = "tbx0247_ctrl_cadl_cont"

  schema_definition {
    column {
      name = "agencia"
      type = "text"
    }
    column {
      name = "codbanco"
      type = "text"
    }
    column {
      name = "conta"
      type = "text"
    }
    column {
      name = "dac10"
      type = "text"
    }
    column {
      name = "num_titr_cont"
      type = "int"
    }
    column {
      name = "tpempres"
      type = "text"
    }
    column {
      name = "txt_objt_cont"
      type = "text"
    }

    partition_key { name = "agencia" }
    partition_key { name = "codbanco" }
    partition_key { name = "conta" }
    partition_key { name = "dac10" }
    partition_key { name = "num_titr_cont" }
    partition_key { name = "tpempres" }
  }

  tags = {
    Project = "painel-autorizador-debito"
  }
}

# ── tbx0246_ctrl_cadl_clie ──────────────────────────────────────────────────
# PK: cod_idef_tel_pess

resource "aws_keyspaces_table" "tbx0246_ctrl_cadl_clie" {
  keyspace_name = aws_keyspaces_keyspace.presente.name
  table_name    = "tbx0246_ctrl_cadl_clie"

  schema_definition {
    column {
      name = "cod_idef_tel_pess"
      type = "text"
    }
    column {
      name = "cod_tipo_pess"
      type = "text"
    }
    column {
      name = "num_cpf_cnpj"
      type = "text"
    }
    column {
      name = "txt_objt_tel_pess"
      type = "text"
    }

    partition_key { name = "cod_idef_tel_pess" }
  }

  tags = {
    Project = "painel-autorizador-debito"
  }
}

# ── tbx0245_ctrl_cadl_aprx ──────────────────────────────────────────────────
# PK: cod_unic_rfrc_crto

resource "aws_keyspaces_table" "tbx0245_ctrl_cadl_aprx" {
  keyspace_name = aws_keyspaces_keyspace.presente.name
  table_name    = "tbx0245_ctrl_cadl_aprx"

  schema_definition {
    column {
      name = "cod_unic_rfrc_crto"
      type = "text"
    }
    column {
      name = "txt_objt_aprx"
      type = "text"
    }

    partition_key { name = "cod_unic_rfrc_crto" }
  }

  tags = {
    Project = "painel-autorizador-debito"
  }
}

# ── tbx0244_ctrl_autr_crto_debt ─────────────────────────────────────────────
# PK: num_crto

resource "aws_keyspaces_table" "tbx0244_ctrl_autr_crto_debt" {
  keyspace_name = aws_keyspaces_keyspace.presente.name
  table_name    = "tbx0244_ctrl_autr_crto_debt"

  schema_definition {
    column {
      name = "num_crto"
      type = "text"
    }
    column {
      name = "txt_objt_crto"
      type = "text"
    }

    partition_key { name = "num_crto" }
  }

  tags = {
    Project = "painel-autorizador-debito"
  }
}
