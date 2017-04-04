/*
 * GDevelop Core
 * Copyright 2008-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */

#ifndef GDCORE_SERIALIZER_H
#define GDCORE_SERIALIZER_H
#include <string>
#include "GDCore/Serialization/SerializerElement.h"

namespace tinyxml2 { class XMLElement; }

namespace gd
{

/**
 * \brief The class used to save/load projects and GDCore classes
 * from/to XML or JSON.
 *
 * Usage example, with TinyXML:
 \code
    //Unserialize from a XML string:
    tinyxml2::XMLDocument doc;
    if ( !doc.Parse(xmlString.c_str()) )
        return false; //Error in XML file!

    tinyxml2::XMLHandle hdl(&doc);
    gd::SerializerElement rootElement;
    gd::Serializer::FromXML(rootElement, hdl.FirstChildElement().Element());
    game.UnserializeFrom(rootElement);
 \endcode
 */
class GD_CORE_API Serializer
{
public:
    /** \name XML serialization.
     * Serialize a SerializerElement from/to XML.
     */
    ///@{
    #if !defined(EMSCRIPTEN)
	static void ToXML(SerializerElement & element, tinyxml2::XMLElement * xmlElement);
	static void FromXML(SerializerElement & element, const tinyxml2::XMLElement * xmlElement);
	#endif
    ///@}

    /** \name JSON serialization.
     * Serialize a SerializerElement from/to JSON.
     */
    ///@{
	static gd::String ToJSON(const SerializerElement & element);
	static SerializerElement FromJSON(const std::string & json);
    static SerializerElement FromJSON(const gd::String & json)
    {
        return FromJSON(json.ToUTF8());
    }
    ///@}

	virtual ~Serializer() {};
private:
    Serializer() {};
};

}

#endif
