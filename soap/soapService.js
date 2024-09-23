const soap = require('soap');
const { Op } = require('sequelize'); // Importar Op
const Event = require('../models/eventModel');  // Modelo de evento
const Reservation = require('../models/reservationModel');  // Modelo de reserva

module.exports = (server) => {
  const service = {
    EventService: {
      EventPort: {
        createEvent: async (args) => {
          console.log("Solicitud para crear evento recibida: ", args);
          try {
            const newEvent = await Event.create({
              title: args.title,
              date: new Date(args.date),  // Guardar la fecha como un objeto de tipo Date
              location: args.location,
              availableSeats: args.availableSeats
            });
            return { success: `Evento '${newEvent.title}' creado con éxito.` };
          } catch (error) {
            console.error("Error al crear el evento:", error);
            return { success: "Error al crear el evento." };
          }
        },

        makeReservation: async (args) => {
          console.log("Solicitud para hacer una reserva recibida: ", args);
          try {
            const event = await Event.findByPk(args.eventId);
            if (event && event.availableSeats >= args.seats) {
              const newReservation = await Reservation.create({
                name: args.name,
                email: args.email,
                seats: args.seats,
                eventId: args.eventId
              });
              event.availableSeats -= args.seats;
              await event.save();

              return { success: "Reserva realizada con éxito." };
            } else {
              return { success: "No hay suficientes asientos disponibles." };
            }
          } catch (error) {
            console.error("Error al realizar la reserva:", error);
            return { success: "Error al realizar la reserva." };
          }
        },

        // Método para obtener los eventos disponibles
        getEvents: async () => {
          try {
            const events = await Event.findAll({
              where: { availableSeats: { [Op.gt]: 0 } }, // Buscar eventos con asientos disponibles
              attributes: ['id', 'title', 'availableSeats', 'date', 'location'] // Incluir 'date' y 'location'
            });

            const eventList = events.map(event => ({
              id: event.id,
              title: event.title,
              availableSeats: event.availableSeats,
              date: event.date ? event.date.toISOString().split('T')[0] : "",  // Formato YYYY-MM-DD
              location: event.location,
            }));

            return { events: eventList };
          } catch (error) {
            console.error("Error al obtener los eventos:", error);
            return { events: [] };
          }
        },

        // Método para eliminar un evento
        deleteEvent: async (args) => {
          console.log("Solicitud para eliminar evento recibida: ", args);
          try {
            const event = await Event.findByPk(args.eventId);
            if (event) {
              await event.destroy();
              return { success: `Evento eliminado con éxito.` };
            } else {
              return { success: "Evento no encontrado." };
            }
          } catch (error) {
            console.error("Error al eliminar el evento:", error);
            return { success: "Error al eliminar el evento." };
          }
        },

        // Método para actualizar un evento
        updateEvent: async (args) => {
          console.log("Solicitud para actualizar evento recibida: ", args);
          try {
            const event = await Event.findByPk(args.eventId);
            if (event) {
              await event.update({
                title: args.title || event.title,
                availableSeats: args.availableSeats || event.availableSeats,
                date: args.date || event.date, // Asegúrate de manejar el campo date
                location: args.location || event.location, // Asegúrate de manejar el campo location
              });
              return { success: `Evento '${event.title}' actualizado con éxito.` };
            } else {
              return { success: "Evento no encontrado." };
            }
          } catch (error) {
            console.error("Error al actualizar el evento:", error);
            return { success: "Error al actualizar el evento." };
          }
        },

        // Nuevo método para obtener las personas registradas en un evento
        getRegistrations: async (args) => {
          console.log("Solicitud para obtener registros recibida: ", args);
          try {
            const registrations = await Reservation.findAll({
              where: { eventId: args.eventId }, // Obtener las reservas del evento
              attributes: ['id', 'name', 'email', 'seats'] // Seleccionar los campos necesarios
            });

            const registrationList = registrations.map(registration => ({
              id: registration.id,
              name: registration.name,
              email: registration.email,
              seats: registration.seats,
            }));

            return { registrations: registrationList };
          } catch (error) {
            console.error("Error al obtener las reservas:", error);
            return { registrations: [] };
          }
        },
      },
    },
  };

  // Definir el XML del servicio
  const xml = `
  <definitions name="EventService" targetNamespace="http://localhost:3001/wsdl"
      xmlns="http://schemas.xmlsoap.org/wsdl/"
      xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
      xmlns:tns="http://localhost:3001/wsdl"
      xmlns:xsd="http://www.w3.org/2001/XMLSchema">

    <types>
      <xsd:schema targetNamespace="http://localhost:3001/wsdl">
        <!-- Esquema para crear eventos -->
        <xsd:element name="createEventRequest">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="title" type="xsd:string"/>
              <xsd:element name="date" type="xsd:string"/>
              <xsd:element name="location" type="xsd:string"/>
              <xsd:element name="availableSeats" type="xsd:int"/>
            </xsd:all>
          </xsd:complexType>
        </xsd:element>
        <xsd:element name="createEventResponse">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="success" type="xsd:string"/>
            </xsd:all>
          </xsd:complexType>
        </xsd:element>

        <!-- Esquema para hacer una reserva -->
        <xsd:element name="makeReservationRequest">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="name" type="xsd:string"/>
              <xsd:element name="email" type="xsd:string"/>
              <xsd:element name="seats" type="xsd:int"/>
              <xsd:element name="eventId" type="xsd:int"/>
            </xsd:all>
          </xsd:complexType>
        </xsd:element>
        <xsd:element name="makeReservationResponse">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="success" type="xsd:string"/>
            </xsd:all>
          </xsd:complexType>
        </xsd:element>

        <!-- Esquema para obtener eventos disponibles -->
        <xsd:element name="getEventsResponse">
          <xsd:complexType>
            <xsd:sequence>
              <xsd:element name="events" type="tns:eventType" minOccurs="0" maxOccurs="unbounded"/>
            </xsd:sequence>
          </xsd:complexType>
        </xsd:element>

        <xsd:complexType name="eventType">
          <xsd:sequence>
            <xsd:element name="id" type="xsd:int"/>
            <xsd:element name="title" type="xsd:string"/>
            <xsd:element name="availableSeats" type="xsd:int"/>
            <xsd:element name="date" type="xsd:string"/> <!-- Campo 'date' -->
            <xsd:element name="location" type="xsd:string"/> <!-- Campo 'location' -->
          </xsd:sequence>
        </xsd:complexType>

        <!-- Esquema para obtener registros de personas en un evento -->
        <xsd:element name="getRegistrationsRequest">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="eventId" type="xsd:int"/>
            </xsd:all>
          </xsd:complexType>
        </xsd:element>

        <xsd:element name="getRegistrationsResponse">
          <xsd:complexType>
            <xsd:sequence>
              <xsd:element name="registrations" type="tns:registrationType" minOccurs="0" maxOccurs="unbounded"/>
            </xsd:sequence>
          </xsd:complexType>
        </xsd:element>

        <xsd:complexType name="registrationType">
          <xsd:sequence>
            <xsd:element name="id" type="xsd:int"/>
            <xsd:element name="name" type="xsd:string"/>
            <xsd:element name="email" type="xsd:string"/>
            <xsd:element name="seats" type="xsd:int"/>
          </xsd:sequence>
        </xsd:complexType>

        <!-- Esquemas para eliminar y actualizar eventos -->
        <xsd:element name="deleteEventRequest">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="eventId" type="xsd:int"/>
            </xsd:all>
          </xsd:complexType>
        </xsd:element>
        <xsd:element name="deleteEventResponse">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="success" type="xsd:string"/>
            </xsd:all>
          </xsd:complexType>
        </xsd:element>

        <xsd:element name="updateEventRequest">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="eventId" type="xsd:int"/>
              <xsd:element name="title" type="xsd:string"/>
              <xsd:element name="availableSeats" type="xsd:int"/>
              <xsd:element name="date" type="xsd:string"/> <!-- Campo 'date' para actualización -->
              <xsd:element name="location" type="xsd:string"/> <!-- Campo 'location' para actualización -->
            </xsd:all>
          </xsd:complexType>
        </xsd:element>
        <xsd:element name="updateEventResponse">
          <xsd:complexType>
            <xsd:all>
              <xsd:element name="success" type="xsd:string"/>
            </xsd:all>
          </xsd:complexType>
        </xsd:element>
      </xsd:schema>
    </types>

    <message name="createEventRequest">
      <part name="parameters" element="tns:createEventRequest"/>
    </message>
    <message name="createEventResponse">
      <part name="parameters" element="tns:createEventResponse"/>
    </message>

    <message name="makeReservationRequest">
      <part name="parameters" element="tns:makeReservationRequest"/>
    </message>
    <message name="makeReservationResponse">
      <part name="parameters" element="tns:makeReservationResponse"/>
    </message>

    <!-- Mensaje para obtener eventos -->
    <message name="getEventsRequest"/>
    <message name="getEventsResponse">
      <part name="parameters" element="tns:getEventsResponse"/>
    </message>

    <!-- Mensaje para obtener registros -->
    <message name="getRegistrationsRequest"/>
    <message name="getRegistrationsResponse">
      <part name="parameters" element="tns:getRegistrationsResponse"/>
    </message>

    <!-- Mensajes para eliminar y actualizar eventos -->
    <message name="deleteEventRequest"/>
    <message name="deleteEventResponse">
      <part name="parameters" element="tns:deleteEventResponse"/>
    </message>

    <message name="updateEventRequest"/>
    <message name="updateEventResponse">
      <part name="parameters" element="tns:updateEventResponse"/>
    </message>

    <portType name="EventPortType">
      <operation name="createEvent">
        <input message="tns:createEventRequest"/>
        <output message="tns:createEventResponse"/>
      </operation>
      <operation name="makeReservation">
        <input message="tns:makeReservationRequest"/>
        <output message="tns:makeReservationResponse"/>
      </operation>
      <!-- Nueva operación para obtener eventos -->
      <operation name="getEvents">
        <input message="tns:getEventsRequest"/>
        <output message="tns:getEventsResponse"/>
      </operation>
      <!-- Operación para obtener registros -->
      <operation name="getRegistrations">
        <input message="tns:getRegistrationsRequest"/>
        <output message="tns:getRegistrationsResponse"/>
      </operation>
      <!-- Operaciones para eliminar y actualizar eventos -->
      <operation name="deleteEvent">
        <input message="tns:deleteEventRequest"/>
        <output message="tns:deleteEventResponse"/>
      </operation>
      <operation name="updateEvent">
        <input message="tns:updateEventRequest"/>
        <output message="tns:updateEventResponse"/>
      </operation>
    </portType>

    <binding name="EventBinding" type="tns:EventPortType">
      <soap:binding transport="http://schemas.xmlsoap.org/soap/http" style="rpc"/>
      <operation name="createEvent">
        <soap:operation soapAction="http://localhost:3001/wsdl#createEvent"/>
        <input>
          <soap:body use="literal"/>
        </input>
        <output>
          <soap:body use="literal"/>
        </output>
      </operation>
      <operation name="makeReservation">
        <soap:operation soapAction="http://localhost:3001/wsdl#makeReservation"/>
        <input>
          <soap:body use="literal"/>
        </input>
        <output>
          <soap:body use="literal"/>
        </output>
      </operation>
      <!-- Nueva operación para obtener eventos -->
      <operation name="getEvents">
        <soap:operation soapAction="http://localhost:3001/wsdl#getEvents"/>
        <input>
          <soap:body use="literal"/>
        </input>
        <output>
          <soap:body use="literal"/>
        </output>
      </operation>
      <!-- Nueva operación para obtener registros -->
      <operation name="getRegistrations">
        <soap:operation soapAction="http://localhost:3001/wsdl#getRegistrations"/>
        <input>
          <soap:body use="literal"/>
        </input>
        <output>
          <soap:body use="literal"/>
        </output>
      </operation>
      <!-- Operaciones para eliminar y actualizar eventos -->
      <operation name="deleteEvent">
        <soap:operation soapAction="http://localhost:3001/wsdl#deleteEvent"/>
        <input>
          <soap:body use="literal"/>
        </input>
        <output>
          <soap:body use="literal"/>
        </output>
      </operation>
      <operation name="updateEvent">
        <soap:operation soapAction="http://localhost:3001/wsdl#updateEvent"/>
        <input>
          <soap:body use="literal"/>
        </input>
        <output>
          <soap:body use="literal"/>
        </output>
      </operation>
    </binding>

    <service name="EventService">
      <port name="EventPort" binding="tns:EventBinding">
        <soap:address location="http://localhost:3001/wsdl"/>
      </port>
    </service>
  </definitions>`;

  soap.listen(server, '/wsdl', service, xml);
};
