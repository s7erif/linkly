export class DashboardProjectionService{private revision=0;refresh(){this.revision+=1;return this.revision}getRevision(){return this.revision}}
