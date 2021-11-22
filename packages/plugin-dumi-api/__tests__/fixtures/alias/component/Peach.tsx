interface IPeachProps {
    className: string;
    age: number;
  }
  
  interface IAppleProps {
    className?: string;
    type: "Peach" | "apple";
  }
  
  export const Apple = ({ className, type }: IAppleProps) => {
    return <div>This is Apple</div>;
  };
  
  export default ({ className, age }: IPeachProps) => {
    return <div>Hello World, ${age}</div>;
  };
  