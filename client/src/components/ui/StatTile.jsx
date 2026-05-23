import { classNames } from "../../utils/helpers";

const StatTile = ({ label, value, tone = "default" }) => {
  return (
    <div className={classNames("status-tile", tone !== "default" && `status-tile-${tone}`)}>
      <span className="label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
};

export default StatTile;