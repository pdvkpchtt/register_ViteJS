import { icons } from "../icons";

const ButtonIcon = ({
  icon = "empty",
  onClick = () => {},
  size = 25,
  color = "var(--color-text)",
  width = 2,
}) => {
  return (
    <button
      type="button"
      className="min-w-[40px] min-h-[40px] items-center justify-center flex transition-colors duration-300 hover:bg-button-hover active:bg-button-active cursor-pointer rounded-full"
      onClick={onClick}
    >
      {icons[icon](size, color, width)}
    </button>
  );
};

export default ButtonIcon;
