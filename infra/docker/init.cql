-- Keyspace
CREATE KEYSPACE IF NOT EXISTS presentekeyspaces
  WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE presentekeyspaces;

-- tbx0244_ctrl_autr_crto_debt
-- PK: num_crto
CREATE TABLE IF NOT EXISTS tbx0244_ctrl_autr_crto_debt (
  num_crto     text,
  txt_objt_crto text,
  PRIMARY KEY (num_crto)
);

-- tbx0245_ctrl_cadl_aprx
-- PK: cod_unic_rfrc_crto
CREATE TABLE IF NOT EXISTS tbx0245_ctrl_cadl_aprx (
  cod_unic_rfrc_crto text,
  txt_objt_aprx      text,
  PRIMARY KEY (cod_unic_rfrc_crto)
);

-- tbx0246_ctrl_cadl_clie
-- PK: cod_idef_tel_pess
CREATE TABLE IF NOT EXISTS tbx0246_ctrl_cadl_clie (
  cod_idef_tel_pess  text,
  cod_tipo_pess      text,
  num_cpf_cnpj       text,
  txt_objt_tel_pess  text,
  PRIMARY KEY (cod_idef_tel_pess)
);

-- tbx0247_ctrl_cadl_cont
-- PK composta (todas partition keys): agencia, codbanco, conta, dac10, num_titr_cont, tpempres
CREATE TABLE IF NOT EXISTS tbx0247_ctrl_cadl_cont (
  agencia       text,
  codbanco      text,
  conta         text,
  dac10         text,
  num_titr_cont int,
  tpempres      text,
  txt_objt_cont text,
  PRIMARY KEY ((agencia, codbanco, conta, dac10, num_titr_cont, tpempres))
);
