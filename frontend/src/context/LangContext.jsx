import { createContext, useContext, useState } from "react";

const translations = {
  pt: {
    appSubtitle: (owned, missing) =>
      `${owned} itens na coleção${missing > 0 ? ` · ${missing} faltando` : ""}`,
    tabs: {
      collection: "Minha Coleção",
      add: "Adicionar",
      missing: "Faltando",
      catalog: "Catálogo",
    },
    collection: {
      title: "Minha Coleção",
      filter: "Filtrar...",
      empty: "Sua coleção está vazia. Adicione o primeiro item!",
      emptyFilter: "Nenhum item encontrado.",
      remove: "Remover",
      loading: "Carregando...",
      confirmRemove: "Remover item da coleção?",
      unknown: "Desconhecido",
    },
    add: {
      title: "Adicionar Item",
      aiMode: "🤖 Identificar por foto (IA)",
      manualMode: "✏️ Cadastro manual",
      front: "Frente *",
      back: "Verso / Caixa",
      series: "Série",
      name: "Nome",
      number: "Número",
      variant: "Variante",
      category: "Categoria",
      notes: "Observações",
      notesPlaceholder: "Estado, edição limitada, local de compra...",
      submit: "Identificar e Salvar",
      submitManual: "Salvar",
      processing: "Processando...",
      saved: "✓ Item salvo!",
      confidence: "Confiança da IA",
      errorFront: "Selecione ao menos a foto da frente.",
      errorAI: "Erro ao identificar:",
      errorSave: "Erro ao salvar:",
      categories: { funko_pop: "Funko Pop", action_figure: "Action Figure", vinyl: "Vinyl", other: "Outro" },
    },
    missing: {
      title: "Faltando",
      allSeries: "Todas as séries",
      complete: "Coleção completa! 🎉",
      emptyAll: "Nada faltando — catálogo vazio ou coleção completa!",
      emptySeries: (s) => `Você tem todos os itens da série "${s}"!`,
      tip: "Adicione itens ao catálogo de referência para ver o que está faltando na sua coleção.",
      loading: "Carregando...",
    },
    catalog: {
      title: "Catálogo de Referência",
      subtitle: "Gerencie as séries e todos os itens que existem em cada uma.",
      addSeries: "+ Nova série",
      addItem: "+ Adicionar item",
      saveSeries: "Criar série",
      saveItem: "Adicionar",
      cancel: "Cancelar",
      saving: "Salvando...",
      empty: "Catálogo vazio. Crie a primeira série para começar.",
      seriesName: "Nome da série",
      seriesNamePlaceholder: "Marvel, Star Wars, Disney...",
      itemName: "Nome *",
      itemNamePlaceholder: "Spider-Man, Darth Vader...",
      itemNumber: "Nº",
      itemVariant: "Variante",
      itemVariantPlaceholder: "Glow in the Dark...",
      category: "Categoria",
      owned: "Tenho",
      notOwned: "Falta",
      complete: "Completa!",
      confirmDeleteItem: "Remover item do catálogo?",
      confirmDeleteSeries: "Remover a série e todos os seus itens?",
      deleteSeries: "Excluir série",
      progress: (owned, total) => `${owned} de ${total}`,
      loading: "Carregando...",
      categories: { funko_pop: "Funko Pop", action_figure: "Action Figure", vinyl: "Vinyl", other: "Outro" },
      tableNumber: "#",
      tableName: "Nome",
      tableVariant: "Variante",
      tableStatus: "Status",
      tableActions: "",
    },
  },
  en: {
    appSubtitle: (owned, missing) =>
      `${owned} items in collection${missing > 0 ? ` · ${missing} missing` : ""}`,
    tabs: {
      collection: "My Collection",
      add: "Add Item",
      missing: "Missing",
      catalog: "Catalog",
    },
    collection: {
      title: "My Collection",
      filter: "Filter...",
      empty: "Your collection is empty. Add the first item!",
      emptyFilter: "No items found.",
      remove: "Remove",
      loading: "Loading...",
      confirmRemove: "Remove item from collection?",
      unknown: "Unknown",
    },
    add: {
      title: "Add Item",
      aiMode: "🤖 Identify by photo (AI)",
      manualMode: "✏️ Manual entry",
      front: "Front *",
      back: "Back / Box",
      series: "Series",
      name: "Name",
      number: "Number",
      variant: "Variant",
      category: "Category",
      notes: "Notes",
      notesPlaceholder: "Condition, limited edition, purchase location...",
      submit: "Identify & Save",
      submitManual: "Save",
      processing: "Processing...",
      saved: "✓ Item saved!",
      confidence: "AI Confidence",
      errorFront: "Please select at least the front photo.",
      errorAI: "Error identifying:",
      errorSave: "Error saving:",
      categories: { funko_pop: "Funko Pop", action_figure: "Action Figure", vinyl: "Vinyl", other: "Other" },
    },
    missing: {
      title: "Missing",
      allSeries: "All series",
      complete: "Collection complete! 🎉",
      emptyAll: "Nothing missing — catalog empty or collection complete!",
      emptySeries: (s) => `You have all items from "${s}"!`,
      tip: "Add items to the reference catalog to see what's missing from your collection.",
      loading: "Loading...",
    },
    catalog: {
      title: "Reference Catalog",
      subtitle: "Manage series and all items that exist in each one.",
      addSeries: "+ New series",
      addItem: "+ Add item",
      saveSeries: "Create series",
      saveItem: "Add",
      cancel: "Cancel",
      saving: "Saving...",
      empty: "Catalog is empty. Create the first series to get started.",
      seriesName: "Series name",
      seriesNamePlaceholder: "Marvel, Star Wars, Disney...",
      itemName: "Name *",
      itemNamePlaceholder: "Spider-Man, Darth Vader...",
      itemNumber: "No.",
      itemVariant: "Variant",
      itemVariantPlaceholder: "Glow in the Dark...",
      category: "Category",
      owned: "Owned",
      notOwned: "Missing",
      complete: "Complete!",
      confirmDeleteItem: "Remove item from catalog?",
      confirmDeleteSeries: "Remove the series and all its items?",
      deleteSeries: "Delete series",
      progress: (owned, total) => `${owned} of ${total}`,
      loading: "Loading...",
      categories: { funko_pop: "Funko Pop", action_figure: "Action Figure", vinyl: "Vinyl", other: "Other" },
      tableNumber: "#",
      tableName: "Name",
      tableVariant: "Variant",
      tableStatus: "Status",
      tableActions: "",
    },
  },
};

const LangContext = createContext();

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "pt");

  function toggle() {
    const next = lang === "pt" ? "en" : "pt";
    setLang(next);
    localStorage.setItem("lang", next);
  }

  return (
    <LangContext.Provider value={{ lang, toggle, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
