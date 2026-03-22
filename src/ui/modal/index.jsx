import { createContext, useState } from "react";

import Modal from "../../shared/ui/Modal";
import WorkSpaceModalHandler from "./WorkSpaceSteps/WorkSpaceModalHandler";
import CreatePageModalHandler from "./CreatePage/CreatePageModalHandler";
import ScreenShotsModalNewHandler from "./ScreenShotsModalNew/ScreenShotsModalNewHandler";
import ImportElementsModalHandler from "./ImportElements/ImportElementsModalHandler";
import ConfirmationModal from "./ConfirmationModal/ConfirmationModal";
import AiModal from "./AiModal/AiModal";
import PromptModal from "./PromptModal/PromptModal";

export const ModalContext = createContext();

const ModalHandlerWrap = ({ children }) => {
  const [workSpaceModal, setWorkSpaceModal] = useState(false);
  const [createPageModal, setCreatePageModal] = useState(false);
  const [importModal, setImportModal] = useState(false);
  const [screenshotModal, setScreenshotModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [aiApiModal, setAiApiModal] = useState(false);
  const [promtModal, setPromtModal] = useState(false);

  const [image, setImage] = useState(null);

  const handleScreenshot = (img) => {
    setImage(img);

    setScreenshotModal(true);
  };

  const [confirmationCallback, setConfirmationCallback] = useState({
    callback: () => {},
  });
  const handleConfirmation = (callBack = () => {}) => {
    setConfirmationCallback({ callBack });
    setConfirmationModal(true);
  };

  return (
    <ModalContext.Provider
      value={{
        setWorkSpaceModal,
        createPageModal,
        setCreatePageModal,
        handleScreenshot,
        importModal,
        setImportModal,
        handleConfirmation,
        aiApiModal,
        setAiApiModal,
        promtModal,
        setPromtModal,
      }}
    >
      {children}

      <Modal
        width={720}
        height={380}
        isOpen={workSpaceModal}
        handleClose={setWorkSpaceModal}
      >
        <WorkSpaceModalHandler width={720} handleClose={setWorkSpaceModal} />
      </Modal>
    </ModalContext.Provider>
  );
};

export default ModalHandlerWrap;
