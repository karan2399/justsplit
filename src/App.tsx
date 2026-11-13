import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { AboutPage } from "./components/AboutPage";
import { AppHeader } from "./components/AppHeader";
import { BillSummary } from "./components/BillSummary";
import { ItemsSection } from "./components/ItemsSection";
import { PeopleSection } from "./components/PeopleSection";
import { SplitPage } from "./components/SplitPage";
import { useSavedPeople } from "./hooks/useSavedPeople";
import { calculateTotals } from "./utils/bill";
import { downloadBillPdf } from "./utils/billPdf";
import type { Item } from "./types";

type Page = "split" | "about";

function App() {
  const { people, setPeople, savePeople, storageError } = useSavedPeople();
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [activePage, setActivePage] = useState<Page>("split");
  const [formError, setFormError] = useState("");
  const [pdfError, setPdfError] = useState("");

  const totals = useMemo(() => calculateTotals(people, items), [people, items]);

  const addPerson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setFormError("Add a name to get started.");
      return;
    }
    if (people.some((person) => person.name.toLowerCase() === cleanName.toLowerCase())) {
      setFormError("That name is already in your split.");
      return;
    }

    const updatedPeople = [...people, { id: crypto.randomUUID(), name: cleanName }];
    setPeople(updatedPeople);
    savePeople(updatedPeople);
    setName("");
    setFormError("");
  };

  const removePerson = (personId: string) => {
    const updatedPeople = people.filter((person) => person.id !== personId);
    setPeople(updatedPeople);
    savePeople(updatedPeople);
    setItems((current) =>
      current.map((item) => ({
        ...item,
        sharedBy: item.sharedBy.filter((id) => id !== personId),
      })),
    );
  };

  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanName = itemName.trim();
    const price = Number(itemPrice);
    if (!cleanName || !itemPrice || !Number.isFinite(price) || price <= 0) {
      setFormError("Enter an item name and a price greater than $0.");
      return;
    }

    setItems((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        name: cleanName,
        quantity: 1,
        price,
        taxPercent: 0,
        sharedBy: [],
      },
    ]);
    setItemName("");
    setItemPrice("");
    setFormError("");
  };

  const updateItem = (itemId: string, update: Partial<Item>) => {
    setItems((current) =>
      current.map((item) => (item.id === itemId ? { ...item, ...update } : item)),
    );
  };

  const removeItem = (itemId: string) => {
    setItems((current) => current.filter((item) => item.id !== itemId));
  };

  const importItems = (importedItems: Item[]) => {
    setItems((current) => [...current, ...importedItems]);
    setFormError("");
  };

  const handleDownloadPdf = () => {
    try {
      downloadBillPdf(people, items, totals);
      setPdfError("");
    } catch (error) {
      console.error("Could not export bill as a PDF.", error);
      setPdfError("The PDF could not be created. Please try again.");
    }
  };

  const clearFormError = () => setFormError("");

  return (
    <div className="app-shell">
      <AppHeader
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <main className="main-content" id="home">
        {activePage === "about" ? (
          <AboutPage onStart={() => setActivePage("split")} />
        ) : (
          <SplitPage
            formError={formError}
            storageError={storageError}
            peopleSection={
              <PeopleSection
                people={people}
                name={name}
                onNameChange={(value) => {
                  setName(value);
                  clearFormError();
                }}
                onSubmit={addPerson}
                onRemove={removePerson}
              />
            }
            itemsSection={
              <ItemsSection
                items={items}
                people={people}
                itemName={itemName}
                itemPrice={itemPrice}
                onItemNameChange={(value) => {
                  setItemName(value);
                  clearFormError();
                }}
                onItemPriceChange={(value) => {
                  setItemPrice(value);
                  clearFormError();
                }}
                onSubmit={addItem}
                onImportItems={importItems}
                onUpdateItem={updateItem}
                onRemoveItem={removeItem}
              />
            }
            summary={
              <BillSummary
                people={people}
                items={items}
                totals={totals}
                pdfError={pdfError}
                onDownloadPdf={handleDownloadPdf}
              />
            }
          />
        )}
      </main>
      <footer className="footer">
        <span>Made by Karan Patel</span>
        <button onClick={() => setActivePage("about")}>How to use JustSplit</button>
      </footer>
    </div>
  );
}

export default App;
