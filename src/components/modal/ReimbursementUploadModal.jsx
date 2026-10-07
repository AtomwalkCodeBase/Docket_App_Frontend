import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { FiX, FiUploadCloud, FiFile, FiTrash2 } from "react-icons/fi";
import { safeText } from "../../utils/reimbursementUtils";
import { uploadGovtFeeAttachment } from "../../services/productServices";

const MAX_SIZE_MB = 1;
// The PO / Ref No is sent as file_ref_num in both ADD_FILE and UPDATE_FILE.
const REQUIRE_REF_NO = true;
const ACCEPT = ".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(15, 23, 42, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: var(--rf-surface, #ffffff);
  border-radius: var(--rf-radius-md, 12px);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.3);
  font-family: var(--rf-font-sans, "IBM Plex Sans", system-ui, sans-serif);
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 24px 14px;
  border-bottom: 1px solid var(--rf-line, #e5e7eb);
`;

const HeaderTitle = styled.h2`
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: var(--rf-ink, #111827);
`;

const HeaderSub = styled.p`
  margin: 0;
  font-size: 13px;
  color: var(--rf-slate, #6b7280);
`;

const CloseButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--rf-slate, #6b7280);
  cursor: pointer;

  &:hover {
    background: var(--rf-paper, #f3f4f6);
  }
`;

const Body = styled.div`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 700;
  color: var(--rf-ink, #111827);
`;

const DropZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 28px 16px;
  text-align: center;
  border: 2px dashed ${({ $active, $error }) =>
    $error ? "var(--rf-rust, #b91c1c)" : $active ? "var(--rf-brass, #b7791f)" : "var(--rf-line-strong, #cbd5e1)"};
  border-radius: var(--rf-radius-md, 12px);
  background: ${({ $active }) => ($active ? "var(--rf-brass-soft, #fef3c7)" : "var(--rf-paper, #f8fafc)")};
  color: var(--rf-slate, #6b7280);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;

  &:hover {
    border-color: var(--rf-brass, #b7791f);
  }

  &:focus-visible {
    outline: 2px solid var(--rf-brass, #b7791f);
    outline-offset: 2px;
  }
`;

const DropTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: var(--rf-ink, #111827);

  b {
    color: var(--rf-brass-dark, #92400e);
  }
`;

const DropHint = styled.span`
  font-size: 12px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1px solid var(--rf-line, #e5e7eb);
  border-radius: var(--rf-radius-sm, 8px);
  background: var(--rf-paper, #f8fafc);
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const FileName = styled.span`
  font-size: 13.5px;
  font-weight: 600;
  color: var(--rf-ink, #111827);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileSize = styled.span`
  font-size: 12px;
  color: var(--rf-slate, #6b7280);
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--rf-rust, #b91c1c);
  cursor: pointer;

  &:hover {
    background: #fee2e2;
  }
`;

const Note = styled.p`
  margin: 0;
  font-size: 12.5px;
  color: var(--rf-slate, #6b7280);
`;

const ErrorText = styled.span`
  font-size: 12.5px;
  color: var(--rf-rust, #b91c1c);
`;

const RefInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid var(--rf-line-strong, #cbd5e1);
  border-radius: var(--rf-radius-sm, 8px);
  background: var(--rf-surface, #ffffff);
  color: var(--rf-ink, #111827);
  font-family: inherit;
  font-size: 14px;

  &::placeholder {
    color: var(--rf-slate, #9ca3af);
  }

  &:focus {
    outline: none;
    border-color: var(--rf-brass, #b7791f);
    box-shadow: 0 0 0 3px var(--rf-brass-soft, #fef3c7);
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 24px 20px;
  border-top: 1px solid var(--rf-line, #e5e7eb);
`;

const CancelButton = styled.button`
  padding: 10px 18px;
  border-radius: var(--rf-radius-sm, 8px);
  border: 1px solid var(--rf-line-strong, #cbd5e1);
  background: var(--rf-surface, #ffffff);
  color: var(--rf-ink-soft, #374151);
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--rf-paper, #f3f4f6);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: var(--rf-radius-sm, 8px);
  border: 1px solid transparent;
  background: var(--rf-brass, #b7791f);
  color: #ffffff;
  font-size: 13.5px;
  font-weight: 700;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: var(--rf-brass-dark, #92400e);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const toText = (v) => (v === null || v === undefined ? "" : String(v).trim());

// onUploaded(res, successMessage): called after a successful upload so the parent can
// show its success toast and reload the list.
const ReimbursementUploadModal = ({ record, onClose, onUploaded }) => {
  const hasAttachment = toText(record?.ref_order_file) !== "";
  const [file, setFile] = useState(null);
  const [refNote, setRefNote] = useState(() => toText(record?.po_ref_number));
  const [remarks, setRemarks] = useState(() => toText(record?.additional_remarks));
  const [refError, setRefError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Close on Escape (unless an upload is in progress).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const pickFile = (picked) => {
    if (!picked) return;
    if (picked.size > MAX_SIZE_MB * 1024 * 1024) {
      setFile(null);
      setFileError(`File is too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    setFileError("");
    setFile(picked);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async () => {
    const refNum = refNote.trim();
    setSubmitError("");
    if (!file) {
      setFileError(
        hasAttachment ? "Please choose a new file to replace the current one." : "Please choose a file to upload."
      );
      return;
    }
    if (REQUIRE_REF_NO && !refNum) {
      setRefError("Please enter the PO / Ref No.");
      return;
    }

    // multipart/form-data: do not set Content-Type manually.
    const formData = new FormData();
    formData.append("invoice_number", toText(record?.invoice_number));
    formData.append("file_ref_num", refNum);
    formData.append("remarks", remarks.trim());
    formData.append("ref_order_file", file);
    formData.append("call_mode", hasAttachment ? "UPDATE_FILE" : "ADD_FILE");

    setSubmitting(true);
    try {
      const res = await uploadGovtFeeAttachment(formData);
      if (res?.status && res.status >= 400) {
        throw new Error(res?.data?.message || "Upload failed. Please try again.");
      }
      const successMessage = hasAttachment
        ? "Attachment updated successfully."
        : "Attachment uploaded successfully.";
      toast.success(successMessage);
      if (onUploaded) await onUploaded(res, successMessage);
      onClose();
    } catch (err) {
      setSubmitError(err?.response?.data?.message || err?.message || "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Overlay onMouseDown={(e) => e.target === e.currentTarget && !submitting && onClose()}>
      <Dialog role="dialog" aria-modal="true" aria-labelledby="rf-upload-title">
        <Header>
          <div>
            <HeaderTitle id="rf-upload-title">{hasAttachment ? "Update Document" : "Upload Document"}</HeaderTitle>
            <HeaderSub>
              {safeText(record?.customer_name)} · {safeText(record?.invoice_number)}
            </HeaderSub>
          </div>
          <CloseButton type="button" onClick={onClose} disabled={submitting} aria-label="Close">
            <FiX size={18} />
          </CloseButton>
        </Header>

        <Body>
          <Field>
            <Label>{hasAttachment ? "Replace file" : "Upload file"}</Label>
            {hasAttachment && <Note>A file is already attached. Choose a new file to replace it.</Note>}

            {file ? (
              <FileRow>
                <FiFile size={22} />
                <FileInfo>
                  <FileName title={file.name}>{file.name}</FileName>
                  <FileSize>{formatSize(file.size)}</FileSize>
                </FileInfo>
                <RemoveButton type="button" onClick={handleRemoveFile} aria-label="Remove file">
                  <FiTrash2 size={16} />
                </RemoveButton>
              </FileRow>
            ) : (
              <DropZone
                role="button"
                tabIndex={0}
                $active={dragOver}
                $error={!!fileError}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <FiUploadCloud size={28} />
                <DropTitle>
                  Drag &amp; drop a file here, or <b>browse</b>
                </DropTitle>
                <DropHint>PDF, images, Word or Excel · up to {MAX_SIZE_MB} MB</DropHint>
              </DropZone>
            )}

            <HiddenInput
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
            {fileError && <ErrorText>{fileError}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="rf-upload-note">PO / Ref No</Label>
            <RefInput
              id="rf-upload-note"
              type="text"
              value={refNote}
              onChange={(e) => {
                setRefNote(e.target.value);
                setRefError("");
              }}
              placeholder="PO / Ref No"
              maxLength={20}
            />
            {refError && <ErrorText>{refError}</ErrorText>}
          </Field>

          <Field>
            <Label htmlFor="rf-upload-remarks">Additional Remarks</Label>
            <RefInput
              as="textarea"
              rows={3}
              id="rf-upload-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Additional remarks (optional)"
            />
          </Field>

          {submitError && <ErrorText role="alert">{submitError}</ErrorText>}
        </Body>

        <Footer>
          <CancelButton type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </CancelButton>
          <SubmitButton type="button" onClick={handleSubmit} disabled={submitting}>
            <FiUploadCloud size={15} />
            <span>
              {submitting
                ? hasAttachment
                  ? "Updating…"
                  : "Uploading…"
                : hasAttachment
                  ? "Update File"
                  : "Upload"}
            </span>
          </SubmitButton>
        </Footer>
      </Dialog>
    </Overlay>
  );
};

export default ReimbursementUploadModal;