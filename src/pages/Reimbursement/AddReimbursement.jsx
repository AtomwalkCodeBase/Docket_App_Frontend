import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiX,
  FiPlus,
  FiAlertCircle,
  FiUser,
  FiPackage,
  FiCheck,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ConfirmReimbursementModal, {
  PrimaryBtn,
  SecondaryBtn,
  SectionIconCircle,
  SpinIcon,
} from "../../components/modal/ConfirmReimbursementModal";
import { getCustomerListView, getProductList, createReimbursementOrder } from "../../services/productServices";
import {
  formatCurrency,
  todayISO,
  getInvoiceDateError,
  getInvoiceDateWarning,
  isoToDDMMYYYY,
  normalizeListResponse,
  getProductLabel,
  getProductPriceHint,
  extractApiError,
  MAX_QTY_DIGITS,
  sanitizeQuantity,
  sanitizePrice,
  getQuantityError,
  getPriceError,
} from "../../utils/reimbursementUtils";
import ReimbursementItems from "../../components/reimbursement/ReimbursementItems";

const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  max-width: 1180px;
  width: 100%;
  margin: 10px auto 16px;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid var(--rf-line);
  background: var(--rf-surface);
  color: var(--rf-ink);
  cursor: pointer;
  flex-shrink: 0;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--rf-brass-soft);
    border-color: var(--rf-brass);
    color: var(--rf-brass-dark);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Title = styled.h1`
  font-family: var(--rf-font-serif, "IBM Plex Serif", Georgia, serif);
  font-size: 24px;
  font-weight: 700;
  color: var(--rf-ink);
  margin: 0 0 2px;
  line-height: 1.2;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: var(--rf-slate);
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 1180px;
  width: 100%;
  margin: 0 auto;
`;

const FormBanner = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  border-radius: var(--rf-radius-sm);
  background: var(--rf-rust-soft);
  color: var(--rf-rust);
  font-size: 12.5px;
  line-height: 1.5;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const SectionCard = styled.div`
  position: relative;
  overflow: visible;
  background: var(--rf-surface);
  border: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md);
  box-shadow: var(--rf-shadow-sm);
`;

const InvoiceCard = styled(SectionCard)`
  z-index: 2;
`;

const ItemsCard = styled(SectionCard)`
  z-index: 1;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  background: var(--rf-paper);
  border-bottom: 1px solid var(--rf-line);
  border-radius: var(--rf-radius-md) var(--rf-radius-md) 0 0;

  @media (max-width: 560px) {
    padding: 12px 16px;
  }
`;

const SectionHeading = styled.h2`
  margin: 0;
  font-family: var(--rf-font-serif, "IBM Plex Serif", Georgia, serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--rf-ink);
`;

const CardBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 560px) {
    padding: 16px;
  }
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
  gap: 20px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
  min-width: 0;
`;

const Label = styled.label`
  font-size: 12.5px;
  font-weight: 600;
  color: var(--rf-ink-soft);
`;

const Required = styled.span`
  color: var(--rf-rust);
  margin-left: 2px;
`;

const ErrorText = styled.span`
  font-size: 11.5px;
  color: var(--rf-rust);
`;

const WarningText = styled.span`
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 11.5px;
  color: #8a5622;

  svg {
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const inputBorder = ({ $hasError }) => ($hasError ? "var(--rf-rust)" : "var(--rf-line)");

const CONTROL_HEIGHT = "50px";

const focusRing = css`
  &:focus {
    outline: none;
    border-color: var(--rf-brass);
    box-shadow: 0 0 0 1px var(--rf-brass);
  }

  &:disabled {
    background: var(--rf-paper);
    color: var(--rf-slate-light);
  }
`;

const textControl = css`
  width: 100%;
  border: 1px solid ${inputBorder};
  border-radius: var(--rf-radius-sm);
  background: var(--rf-surface);
  font-family: inherit;
  color: var(--rf-ink);
  outline: none;
  box-shadow: none;
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  ${focusRing}
`;

const fieldWrap = css`
  display: flex;
  align-items: center;
  height: ${CONTROL_HEIGHT};
  padding: 0 13px;
  border: 1px solid ${inputBorder};
  border-radius: var(--rf-radius-sm);
  background: var(--rf-surface);
  box-sizing: border-box;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus-within {
    border-color: var(--rf-brass);
    box-shadow: 0 0 0 1px var(--rf-brass);
  }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    box-shadow: none;
    background: transparent;
    font-family: inherit;
    font-size: 14px;
    color: var(--rf-ink);
    height: 100%;

    &:focus {
      outline: none;
      box-shadow: none;
    }
  }
`;

const Input = styled.input`
  ${textControl}
  height: ${CONTROL_HEIGHT};
  padding: 0 13px;
  font-size: 14px;
`;

const Textarea = styled.textarea`
  ${textControl}
  min-height: 84px;
  padding: 12px 13px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
`;

const SelectInputWrap = styled.div`
  ${fieldWrap}
  gap: 9px;
  color: var(--rf-slate);

  svg {
    flex-shrink: 0;
  }
`;

const PriceInputWrap = styled.div`
  ${fieldWrap}
  gap: 6px;
`;

const CurrencyPrefix = styled.span`
  color: var(--rf-slate);
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
`;

const ClearBtn = styled.button`
  background: transparent;
  border: none;
  color: var(--rf-slate);
  cursor: pointer;
  padding: 2px;
  display: flex;
  flex-shrink: 0;

  &:hover {
    color: var(--rf-ink);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow-y: auto;
  background: var(--rf-surface);
  border: 1px solid var(--rf-line-strong);
  border-radius: var(--rf-radius-sm);
  box-shadow: var(--rf-shadow-md);
  z-index: 50;
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid var(--rf-line);
  background: var(--rf-surface);
  font-family: inherit;
  font-size: 12.5px;
  color: var(--rf-ink);
  text-align: left;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  &:hover:not(:disabled) {
    background: var(--rf-paper);
  }

  &:disabled {
    color: var(--rf-slate-light);
    cursor: not-allowed;
    font-style: italic;
  }

  small {
    color: var(--rf-slate);
    font-weight: 500;
    flex-shrink: 0;
  }
`;

const DropdownState = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 12px;
  font-size: 12.5px;
  color: ${({ $error }) => ($error ? "var(--rf-rust)" : "var(--rf-slate)")};
`;

const RetryLink = styled.button`
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--rf-brass);
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  flex-shrink: 0;
`;

const ItemEntry = styled.div`
  position: relative;
  z-index: 5;
  display: grid;
  grid-template-columns: minmax(0, 2.4fr) 100px 150px minmax(0, 1.6fr) 130px;
  gap: 12px;
  align-items: start;
  padding: 14px;
  border: 1px dashed var(--rf-line-strong);
  border-radius: var(--rf-radius-sm);
  background: var(--rf-paper);

  @media (max-width: 1000px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const WideField = styled(Field)`
  @media (max-width: 1000px) {
    grid-column: 1 / -1;
  }
`;

const AddItemFieldWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  @media (max-width: 1000px) {
    grid-column: 1 / -1;

    & > span {
      display: none;
    }
  }
`;

const LabelSpacer = styled.span`
  visibility: hidden;
  font-size: 12.5px;
  font-weight: 600;
  line-height: normal;
`;

const AddItemBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  height: ${CONTROL_HEIGHT};
  padding: 0 14px;
  border-radius: var(--rf-radius-sm);
  border: 1px solid transparent;
  background: var(--rf-brass-soft);
  color: var(--rf-brass-dark);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;
  transition: background-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--rf-brass);
    color: #fff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: var(--rf-paper);
  border-radius: var(--rf-radius-sm);

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TotalBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const TotalLabel = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--rf-slate);
  text-transform: uppercase;
  letter-spacing: 0.03em;
`;

const TotalValue = styled.span`
  font-family: var(--rf-font-serif, "IBM Plex Serif", Georgia, serif);
  font-size: 21px;
  font-weight: 700;
  color: var(--rf-ink);
`;

const FootActions = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 560px) {
    flex-direction: column-reverse;
  }
`;

const emptyDraft = { productId: "", productLabel: "", quantity: "1", price: "", remark: "" };

const AddReimbursement = () => {
  const navigate = useNavigate();

  const goBack = () => navigate("/reimbursement-fees");

  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState(null);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [customerId, setCustomerId] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);

  const [invoiceDate, setInvoiceDate] = useState(todayISO());
  const [additionalRemarks, setAdditionalRemarks] = useState("");

  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [productQuery, setProductQuery] = useState("");
  const [productOpen, setProductOpen] = useState(false);

  const [editingKey, setEditingKey] = useState(null);
  const [editDraft, setEditDraft] = useState({ quantity: "", price: "", remark: "" });
  const [editErrors, setEditErrors] = useState({});

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const customerBoxRef = useRef(null);
  const productBoxRef = useRef(null);

  const loadCustomers = () => {
    setCustomersLoading(true);
    setCustomersError(null);
    getCustomerListView()
      .then((res) => setCustomers(normalizeListResponse(res)))
      .catch((err) => {
        console.error("Failed to load customers:", err);
        setCustomersError(extractApiError(err, "Could not load customers."));
      })
      .finally(() => setCustomersLoading(false));
  };

  const loadProducts = () => {
    setProductsLoading(true);
    setProductsError(null);
    getProductList()
      .then((res) => setProducts(normalizeListResponse(res)))
      .catch((err) => {
        console.error("Failed to load products:", err);
        setProductsError(extractApiError(err, "Could not load products."));
      })
      .finally(() => setProductsLoading(false));
  };

  useEffect(() => {
    loadCustomers();
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (customerBoxRef.current && !customerBoxRef.current.contains(e.target)) {
        setCustomerOpen(false);
        setCustomerQuery("");
      }
      if (productBoxRef.current && !productBoxRef.current.contains(e.target)) {
        setProductOpen(false);
        setProductQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) => {
      return String(c?.name || "").toLowerCase().includes(q);
    });
  }, [customers, customerQuery]);

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();

    const govtFeeProducts = products.filter(
      (p) => String(p?.category || "").trim().toUpperCase() === "GOVT FEE"
    );

    if (!q) return govtFeeProducts;
    return govtFeeProducts.filter((p) => getProductLabel(p).toLowerCase().includes(q));
  }, [products, productQuery]);

  const selectCustomer = (c) => {
    setCustomerId(String(c.id));
    setCustomerLabel(c?.name || `Customer #${c.id}`);
    setCustomerQuery("");
    setCustomerOpen(false);
    setErrors((prev) => ({ ...prev, customer: undefined }));
  };

  const clearCustomer = () => {
    setCustomerId("");
    setCustomerLabel("");
    setCustomerQuery("");
    setErrors((prev) => ({ ...prev, customer: undefined }));
  };

  const selectDraftProduct = (p) => {
    setDraft((prev) => ({
      ...prev,
      productId: String(p.id),
      productLabel: getProductLabel(p),
      price: sanitizePrice(getProductPriceHint(p)),
    }));
    setProductQuery("");
    setProductOpen(false);
    setErrors((prev) => ({ ...prev, draftProduct: undefined }));
  };

  const totalAmount = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0),
    [items]
  );

  const handleAddItem = () => {
    const nextErrors = { draftProduct: undefined, draftQuantity: undefined, draftPrice: undefined };

    if (!draft.productId) {
      nextErrors.draftProduct = "Select a product.";
    }

    const qty = Number(draft.quantity);
    const qtyError = getQuantityError(draft.quantity);
    if (qtyError) nextErrors.draftQuantity = qtyError;

    const price = Number(draft.price);
    const priceError = getPriceError(draft.price);
    if (priceError) nextErrors.draftPrice = priceError;

    const hasError = Object.values(nextErrors).some(Boolean);
    setErrors((prev) => ({ ...prev, ...nextErrors, items: hasError ? prev.items : undefined }));
    if (hasError) return;

    setItems((prev) => [
      ...prev,
      {
        key: `${draft.productId}-${Date.now()}`,
        productId: draft.productId,
        productLabel: draft.productLabel,
        quantity: qty,
        price,
        remark: (draft.remark || "").trim(),
      },
    ]);
    setDraft(emptyDraft);
  };

  const resetEditState = () => {
    setEditingKey(null);
    setEditDraft({ quantity: "", price: "", remark: "" });
    setEditErrors({});
  };

  const handleRemoveItem = (key) => {
    if (key === editingKey) resetEditState();
    setItems((prev) => prev.filter((it) => it.key !== key));
  };

  const handleStartEdit = (it) => {
    if (submitting || (editingKey && editingKey !== it.key)) return;
    setEditingKey(it.key);
    setEditDraft({
      quantity: String(it.quantity),
      price: String(it.price),
      remark: it.remark || "",
    });
    setEditErrors({});
  };

  const handleCancelEdit = () => {
    resetEditState();
    setErrors((prev) => ({ ...prev, items: undefined }));
  };

  const handleSaveEdit = () => {
    if (!editingKey) return;

    const nextEditErrors = {
      quantity: getQuantityError(editDraft.quantity),
      price: getPriceError(editDraft.price),
    };
    if (Object.values(nextEditErrors).some(Boolean)) {
      setEditErrors(nextEditErrors);
      return;
    }

    const qty = Number(editDraft.quantity);
    const price = Number(editDraft.price);
    const remark = (editDraft.remark || "").trim();

    setItems((prev) =>
      prev.map((it) => (it.key === editingKey ? { ...it, quantity: qty, price, remark } : it))
    );
    resetEditState();
    setErrors((prev) => ({ ...prev, items: undefined }));
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const validateForm = () => {
    const nextErrors = { customer: undefined, invoiceDate: undefined, items: undefined };

    if (!customerId) nextErrors.customer = "Select a customer.";

    nextErrors.invoiceDate = getInvoiceDateError(invoiceDate);

    if (items.length === 0) {
      nextErrors.items = "Add at least one item.";
    } else if (editingKey) {
      nextErrors.items = "Save or cancel the item you are editing before continuing.";
    }

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError(null);
    if (!validateForm()) return;

    setConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    if (submitting) return;
    setConfirmModalOpen(false);
  };

  const handleConfirmCreate = async () => {
    if (submitting) return;

    const payload = {
      order_data: {
        invoice_date: isoToDDMMYYYY(invoiceDate),
        customer_id: String(customerId),
        additional_remarks: additionalRemarks.trim(),
        item_list: items.map((it) => ({
          product_id: String(it.productId),
          price: Number(it.price).toFixed(2),
          quantity: Number(it.quantity),
          remarks: it.remark || "",
        })),
      },
    };

    setSubmitting(true);
    try {
      const res = await createReimbursementOrder(payload);
      if (res && res.status == 200) {
        setConfirmModalOpen(false);
        toast.success("Reimbursement created successfully.");
        navigate("/reimbursement-fees");
      } else {
        throw new Error("Unexpected response from the server.");
      }
    } catch (err) {
      console.error("Failed to create reimbursement:", err);
      const message = extractApiError(err, "Could not create the reimbursement. Please try again.");
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const invoiceDateWarning = getInvoiceDateWarning(invoiceDate);

  return (
    <DashboardLayout
      activeNav="reimbursement-fees"
      breadcrumb="Sales / Reimbursement Fees / Add Reimbursement"
      pageTitle="Add Reimbursement"
    >
      <PageHeader>
        <HeaderLeft>
          <BackBtn type="button" onClick={goBack} disabled={submitting} aria-label="Back to Reimbursement Fees">
            <FiArrowLeft size={18} />
          </BackBtn>
          <div>
            <Title>Add Reimbursement</Title>
            <Subtitle>Create a new reimbursement invoice for a customer.</Subtitle>
          </div>
        </HeaderLeft>
      </PageHeader>

      <Form onSubmit={handleSubmit}>
        {submitError && (
          <FormBanner role="alert">
            <FiAlertCircle size={14} />
            <span>{submitError}</span>
          </FormBanner>
        )}

        <InvoiceCard>
          <SectionHeader>
            <SectionIconCircle>
              <FiFileText size={17} />
            </SectionIconCircle>
            <SectionHeading>Reimbursement Details</SectionHeading>
          </SectionHeader>

          <CardBody>
            <FieldsGrid>
              <Field ref={customerBoxRef}>
                <Label htmlFor="rf-add-customer">
                  Customer<Required>*</Required>
                </Label>
                <SelectInputWrap $hasError={!!errors.customer}>
                  <FiUser size={15} />
                  <input
                    id="rf-add-customer"
                    type="text"
                    placeholder={customersLoading ? "Loading customers…" : "Search customer…"}
                    value={customerOpen ? customerQuery || customerLabel : customerLabel}
                    onFocus={(e) => {
                      setCustomerOpen(true);
                      e.target.select();
                    }}
                    onChange={(e) => {
                      setCustomerQuery(e.target.value);
                      setCustomerOpen(true);
                    }}
                    disabled={submitting}
                    autoComplete="off"
                  />
                  {customerLabel && !customerOpen && (
                    <ClearBtn type="button" onClick={clearCustomer} aria-label="Clear selected customer">
                      <FiX size={13} />
                    </ClearBtn>
                  )}
                </SelectInputWrap>
                {customerOpen && (
                  <Dropdown>
                    {customersLoading ? (
                      <DropdownState>
                        <SpinIcon size={13} /> Loading customers…
                      </DropdownState>
                    ) : customersError ? (
                      <DropdownState $error>
                        <FiAlertCircle size={13} />
                        <span>{customersError}</span>
                        <RetryLink type="button" onClick={loadCustomers}>
                          Retry
                        </RetryLink>
                      </DropdownState>
                    ) : filteredCustomers.length === 0 ? (
                      <DropdownState>No customers found.</DropdownState>
                    ) : (
                      filteredCustomers.map((c) => (
                        <DropdownItem key={c.id} type="button" onClick={() => selectCustomer(c)}>
                          <span>{c?.name || `Customer #${c.id}`}</span>
                        </DropdownItem>
                      ))
                    )}
                  </Dropdown>
                )}
                {errors.customer && <ErrorText>{errors.customer}</ErrorText>}
              </Field>

              <Field>
                <Label htmlFor="rf-add-invoice-date">
                  Reimbursement date<Required>*</Required>
                </Label>
                <SelectInputWrap $hasError={!!errors.invoiceDate}>
                  <FiCalendar size={15} />
                  <input
                    id="rf-add-invoice-date"
                    type="date"
                    value={invoiceDate}
                    max={todayISO()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInvoiceDate(value);
                      setErrors((p) => ({ ...p, invoiceDate: value ? getInvoiceDateError(value) : undefined }));
                    }}
                    disabled={submitting}
                  />
                </SelectInputWrap>
                {errors.invoiceDate && <ErrorText>{errors.invoiceDate}</ErrorText>}
                {!errors.invoiceDate && invoiceDateWarning && (
                  <WarningText role="status">
                    <FiAlertCircle size={12} />
                    <span>{invoiceDateWarning}</span>
                  </WarningText>
                )}
              </Field>
            </FieldsGrid>

            <Field>
              <Label htmlFor="rf-add-additional-remarks">Additional Remarks</Label>
              <Textarea
                id="rf-add-additional-remarks"
                rows={3}
                placeholder="Maximum 250 characters"
                value={additionalRemarks}
                onChange={(e) => setAdditionalRemarks(e.target.value)}
                maxLength={250}
                disabled={submitting}
              />
            </Field>
          </CardBody>
        </InvoiceCard>

        <ItemsCard>
          <SectionHeader>
            <SectionIconCircle>
              <FiPackage size={17} />
            </SectionIconCircle>
            <SectionHeading>Items</SectionHeading>
          </SectionHeader>

          <CardBody>
            <ItemEntry>
              <WideField ref={productBoxRef}>
                <Label htmlFor="rf-add-product">
                  Product<Required>*</Required>
                </Label>
                <SelectInputWrap $hasError={!!errors.draftProduct}>
                  <FiPackage size={15} />
                  <input
                    id="rf-add-product"
                    type="text"
                    placeholder={productsLoading ? "Loading products…" : "Search product…"}
                    value={productOpen ? productQuery || draft.productLabel : draft.productLabel}
                    onFocus={(e) => {
                      setProductOpen(true);
                      e.target.select();
                    }}
                    onChange={(e) => {
                      setProductQuery(e.target.value);
                      setProductOpen(true);
                    }}
                    disabled={submitting}
                    autoComplete="off"
                  />
                </SelectInputWrap>
                {productOpen && (
                  <Dropdown>
                    {productsLoading ? (
                      <DropdownState>
                        <SpinIcon size={13} /> Loading products…
                      </DropdownState>
                    ) : productsError ? (
                      <DropdownState $error>
                        <FiAlertCircle size={13} />
                        <span>{productsError}</span>
                        <RetryLink type="button" onClick={loadProducts}>
                          Retry
                        </RetryLink>
                      </DropdownState>
                    ) : filteredProducts.length === 0 ? (
                      <DropdownState>No products found.</DropdownState>
                    ) : (
                      filteredProducts.map((p) => (
                        <DropdownItem key={p.id} type="button" onClick={() => selectDraftProduct(p)}>
                          <span>{getProductLabel(p)}</span>
                        </DropdownItem>
                      ))
                    )}
                  </Dropdown>
                )}
                {errors.draftProduct && <ErrorText>{errors.draftProduct}</ErrorText>}
              </WideField>

              <Field>
                <Label htmlFor="rf-add-qty">
                  Quantity<Required>*</Required>
                </Label>
                <Input
                  id="rf-add-qty"
                  type="text"
                  inputMode="numeric"
                  maxLength={MAX_QTY_DIGITS}
                  value={draft.quantity}
                  onChange={(e) => {
                    setDraft((d) => ({ ...d, quantity: sanitizeQuantity(e.target.value) }));
                    setErrors((p) => ({ ...p, draftQuantity: undefined }));
                  }}
                  disabled={submitting}
                  $hasError={!!errors.draftQuantity}
                />
                {errors.draftQuantity && <ErrorText>{errors.draftQuantity}</ErrorText>}
              </Field>

              <Field>
                <Label htmlFor="rf-add-price">
                  Price<Required>*</Required>
                </Label>
                <PriceInputWrap $hasError={!!errors.draftPrice}>
                  <CurrencyPrefix>₹</CurrencyPrefix>
                  <input
                    id="rf-add-price"
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter price"
                    value={draft.price}
                    onChange={(e) => {
                      setDraft((d) => ({ ...d, price: sanitizePrice(e.target.value) }));
                      setErrors((p) => ({ ...p, draftPrice: undefined }));
                    }}
                    disabled={submitting}
                  />
                </PriceInputWrap>
                {errors.draftPrice && <ErrorText>{errors.draftPrice}</ErrorText>}
              </Field>

              <WideField>
                <Label htmlFor="rf-add-remark">Remark</Label>
                <Input
                  id="rf-add-remark"
                  type="text"
                  placeholder="Maximum 100 characters"
                  value={draft.remark}
                  onChange={(e) => setDraft((d) => ({ ...d, remark: e.target.value }))}
                  maxLength={100}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddItem();
                    }
                  }}
                  disabled={submitting}
                  autoComplete="off"
                />
              </WideField>

              <AddItemFieldWrap>
                <LabelSpacer aria-hidden="true">&nbsp;</LabelSpacer>
                <AddItemBtn type="button" onClick={handleAddItem} disabled={submitting}>
                  <FiPlus size={15} />
                  Add item
                </AddItemBtn>
              </AddItemFieldWrap>
            </ItemEntry>

            {errors.items && <ErrorText>{errors.items}</ErrorText>}

            {items.length > 0 && (
              <ReimbursementItems
                items={items}
                editingKey={editingKey}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                editErrors={editErrors}
                setEditErrors={setEditErrors}
                submitting={submitting}
                onStartEdit={handleStartEdit}
                onRemove={handleRemoveItem}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditKeyDown={handleEditKeyDown}
                sanitizeQuantity={sanitizeQuantity}
                sanitizePrice={sanitizePrice}
                maxQtyDigits={MAX_QTY_DIGITS}
              />
            )}

            <ActionBar>
              <TotalBlock>
                <TotalLabel>Total Amount</TotalLabel>
                <TotalValue>₹{formatCurrency(totalAmount)}</TotalValue>
              </TotalBlock>
              <FootActions>
                <SecondaryBtn type="button" onClick={goBack} disabled={submitting}>
                  Cancel
                </SecondaryBtn>
                <PrimaryBtn type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <SpinIcon size={14} />
                      Creating…
                    </>
                  ) : (
                    <>
                      <FiCheck size={14} />
                      Create reimbursement
                    </>
                  )}
                </PrimaryBtn>
              </FootActions>
            </ActionBar>
          </CardBody>
        </ItemsCard>
      </Form>

      <ConfirmReimbursementModal
        open={confirmModalOpen}
        customerLabel={customerLabel}
        invoiceDate={isoToDDMMYYYY(invoiceDate)}
        additionalRemarks={additionalRemarks}
        items={items}
        totalAmount={totalAmount}
        submitting={submitting}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmCreate}
      />

    </DashboardLayout>
  );
};

export default AddReimbursement;