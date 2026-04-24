import  type  {  SupabaseClient  }  from  "@supabase/supabase-js";

interface  CreateSystemBackupInput  {
    writer:  SupabaseClient;
    contextArea:  string;
    entityTable:  string;
    entityId:  string  |  null;
    backupReason:  string;
    snapshot:  Record<string,  unknown>;
    createdBy:  string  |  null;
}

export  async  function  createSystemBackup(input:  CreateSystemBackupInput):  Promise<void>  {
    const  {  error  }  =  await  input.writer.from("system_backups").insert({
        context_area:  input.contextArea,
        entity_table:  input.entityTable,
        entity_id:  input.entityId,
        backup_reason:  input.backupReason,
        snapshot:  input.snapshot,
        created_by:  input.createdBy
    });

    if  (error)  {
        throw  new  Error("Não  foi  possível  registrar  o  backup  automatico  da  operação.");
    }
}
