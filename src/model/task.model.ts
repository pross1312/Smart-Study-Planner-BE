class Task {
    id: number;
    idUser: number;
    name: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE' = 'TODO';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    estimateTime: number = 3600;
    isDeleted: boolean = false;
  
    constructor({
      id,
      idUser,
      name,
      description,
      status = 'TODO',
      priority = 'LOW',
      estimateTime = 3600,
      isDeleted = false,
    }: Partial<Task>) {
      this.id = id!;
      this.idUser = idUser!;
      this.name = name!;
      this.description = description;
      this.status = status;
      this.priority = priority;
      this.estimateTime = estimateTime;
      this.isDeleted = isDeleted;
    }
}
  
export default Task;
