import { stockroom } from "../apps/stockroom/domain";
export const projects = [stockroom];
export const findProject = (id: string) =>
  projects.find((project) => project.id === id);
