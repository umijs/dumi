interface IHelloProps {
  className?: string;
  name: string;
}
export default ({ className, name }: IHelloProps) => {
  return <div>Hello World, ${name}</div>;
};
