using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

/// <summary>
/// Summary description for JsonSortableList
/// </summary>

public class JsonSortableDictionary<TKey, TValue>
{
    private List<JsonSortableItem<TKey, TValue>> items;

    public JsonSortableDictionary()
    {
        items = new List<JsonSortableItem<TKey, TValue>>();
    }

    public void Add(TKey key, TValue value)
    {
        items.Add(new JsonSortableItem<TKey, TValue>(items.Count + 1, key, value));
    }

    public List<JsonSortableItem<TKey, TValue>> Items
    {
        get { return items; }
    }

    public string ToJson()
    {
        return Json.SerializeObject(items);
    }
}

public class JsonSortableItem<TKey, TValue>
{
    public JsonSortableItem(int index, TKey key, TValue value)
    {
        Index = index;
        Key = key;
        Value = value;
    }

    public int Index
    {
        get;
        set;
    }

    public TKey Key
    {
        get;
        set;
    }

    public TValue Value
    {
        get;
        set;
    }
}