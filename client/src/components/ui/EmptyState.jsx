import { classNames } from "../../utils/helpers";

const EmptyState = ({ children, tone = "empty" }) => {
  return <div className={`${tone}-state`}>{children}</div>;
};

export default EmptyState;