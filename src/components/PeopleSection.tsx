import type { FormEvent } from "react";
import type { Person } from "../types";

type PeopleSectionProps = {
  people: Person[];
  name: string;
  onNameChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRemove: (personId: string) => void;
};

export function PeopleSection({
  people,
  name,
  onNameChange,
  onSubmit,
  onRemove,
}: PeopleSectionProps) {
  return (
    <section className="card people-card">
      <div className="section-heading">
        <div className="section-icon people-icon" aria-hidden="true">01</div>
        <div>
          <h2>Your people</h2>
          <p>Add everyone who's sharing this bill.</p>
        </div>
      </div>
      <form className="add-form people-form" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="person-name">Person's name</label>
        <input
          id="person-name"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="e.g. Alex"
          autoComplete="off"
        />
        <button className="button button-primary" type="submit">
          <span aria-hidden="true">+</span> Add person
        </button>
      </form>
      {people.length > 0 ? (
        <ul className="people-list">
          {people.map((person, index) => (
            <li
              className="person-chip"
              key={person.id}
              style={{ animationDelay: `${index * 35}ms` }}
            >
              <span className="avatar">{person.name.charAt(0).toUpperCase()}</span>
              <span className="person-name">{person.name}</span>
              <button
                className="icon-button remove-person"
                onClick={() => onRemove(person.id)}
                aria-label={`Remove ${person.name}`}
                title={`Remove ${person.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-people">
          <span className="empty-icon" aria-hidden="true">👋</span>
          <span>Your table is waiting. Add the first person!</span>
        </div>
      )}
      <p className="saved-hint"><span aria-hidden="true">↻</span> Your people are saved on this device</p>
    </section>
  );
}
