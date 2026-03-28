output "keyspace_name" {
  description = "Name of the created Keyspace"
  value       = aws_keyspaces_keyspace.presente.name
}

output "keyspace_arn" {
  description = "ARN of the created Keyspace"
  value       = aws_keyspaces_keyspace.presente.arn
}

output "table_arns" {
  description = "ARNs of the created tables"
  value = {
    tbx0247_ctrl_cadl_cont      = aws_keyspaces_table.tbx0247_ctrl_cadl_cont.arn
    tbx0246_ctrl_cadl_clie      = aws_keyspaces_table.tbx0246_ctrl_cadl_clie.arn
    tbx0245_ctrl_cadl_aprx      = aws_keyspaces_table.tbx0245_ctrl_cadl_aprx.arn
    tbx0244_ctrl_autr_crto_debt = aws_keyspaces_table.tbx0244_ctrl_autr_crto_debt.arn
  }
}
