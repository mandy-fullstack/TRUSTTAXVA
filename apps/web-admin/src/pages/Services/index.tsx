import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Modal,
  useWindowDimensions,
} from "react-native";
import { H1, H2, H4, Text } from "@trusttax/ui";
import {
  Briefcase,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  X,
  Search,
} from "lucide-react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { AlertDialog } from "../../components/AlertDialog";

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number | null;
  createdAt: string;
  _count: {
    orders: number;
    reviews: number;
  };
}

const MOBILE_BREAKPOINT = 768;

export const ServicesPage = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < MOBILE_BREAKPOINT;
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    serviceId: string | null;
  }>({ isOpen: false, serviceId: null });
  const [alertDialog, setAlertDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "info",
  });

  // Form state
  const [formData, setFormData] = useState({
    nameEn: "",
    nameEs: "",
    descriptionEn: "",
    descriptionEs: "",
    category: "",
    price: 0,
    originalPrice: 0,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const data = await api.getServices();
      setServices(data);
    } catch (err: any) {
      setError(err.message || "Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      nameEn: "",
      nameEs: "",
      descriptionEn: "",
      descriptionEs: "",
      category: "",
      price: 0,
      originalPrice: 0,
    });
    setShowModal(true);
  };

  const handleEdit = (service: Service) => {
    navigate(`/services/${service.id}`);
  };

  const handleSave = async () => {
    try {
      if (!formData.nameEn.trim() || !formData.nameEs.trim()) {
        setAlertDialog({
          isOpen: true,
          title: "Error",
          message: "Service name is required in both English and Spanish",
          variant: "error",
        });
        return;
      }
      if (!formData.descriptionEn.trim() || !formData.descriptionEs.trim()) {
        setAlertDialog({
          isOpen: true,
          title: "Error",
          message:
            "Service description is required in both English and Spanish",
          variant: "error",
        });
        return;
      }

      const data = {
        nameI18n: {
          en: formData.nameEn.trim(),
          es: formData.nameEs.trim(),
        },
        descriptionI18n: {
          en: formData.descriptionEn.trim(),
          es: formData.descriptionEs.trim(),
        },
        category: formData.category,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice) || undefined,
      };

      if (editingService) {
        await api.updateService(editingService.id, data);
        setAlertDialog({
          isOpen: true,
          title: "Success",
          message: "Service updated successfully",
          variant: "success",
        });
      } else {
        await api.createService(data);
        setAlertDialog({
          isOpen: true,
          title: "Success",
          message: "Service created successfully",
          variant: "success",
        });
      }

      setShowModal(false);
      loadServices();
    } catch (err: any) {
      setAlertDialog({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to save service",
        variant: "error",
      });
    }
  };

  const handleDelete = (serviceId: string) => {
    setConfirmDialog({ isOpen: true, serviceId });
  };

  const confirmDelete = async () => {
    if (!confirmDialog.serviceId) return;
    try {
      await api.deleteService(confirmDialog.serviceId);
      setConfirmDialog({ isOpen: false, serviceId: null });
      setAlertDialog({
        isOpen: true,
        title: "Success",
        message: "Service deleted successfully",
        variant: "success",
      });
      loadServices();
    } catch (err: any) {
      setConfirmDialog({ isOpen: false, serviceId: null });
      setAlertDialog({
        isOpen: true,
        title: "Error",
        message: err.message || "Failed to delete service",
        variant: "error",
      });
    }
  };

  // Filter and group services
  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupedServices = filteredServices.reduce(
    (acc, service) => {
      const cat = service.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(service);
      return acc;
    },
    {} as Record<string, Service[]>,
  );

  const categories = Object.keys(groupedServices).sort();

  if (loading) {
    return (
      <Layout>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0F172A" />
        </View>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.container,
          isMobile && styles.containerMobile,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, isMobile && styles.headerMobile]}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <H1 style={isMobile ? styles.titleMobile : undefined}>Services</H1>
            <Text style={styles.subtitle}>
              {filteredServices.length}{" "}
              {filteredServices.length === 1 ? "service" : "services"} found
            </Text>
          </View>
          <View
            style={[
              styles.headerActions,
              isMobile && styles.headerActionsMobile,
            ]}
          >
            <View
              style={[styles.searchBar, isMobile && styles.searchBarMobile]}
            >
              <Search size={18} color="#94A3B8" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search services..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreate}
              activeOpacity={0.7}
            >
              <Plus size={20} color="#FFF" />
              <Text style={styles.createButtonText}>New Service</Text>
            </TouchableOpacity>
          </View>
        </View>

        {categories.map((category) => (
          <View key={category} style={styles.categorySection}>
            <H4 style={styles.categoryTitle}>{category}</H4>
            <View
              style={[
                styles.servicesGrid,
                isMobile && styles.servicesGridMobile,
              ]}
            >
              {groupedServices[category].map((service) => (
                <View
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    isMobile && styles.serviceCardMobile,
                  ]}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                      <Briefcase size={24} color="#2563EB" />
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        onPress={() => handleEdit(service)}
                        style={styles.iconButton}
                      >
                        <Edit size={16} color="#64748B" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(service.id)}
                        style={styles.iconButton}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <H4 style={styles.serviceName}>{service.name}</H4>
                  <Text style={styles.categoryBadge}>{service.category}</Text>
                  <Text style={styles.description} numberOfLines={2}>
                    {service.description}
                  </Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.priceContainer}>
                      <View style={styles.priceColumn}>
                        {service.originalPrice &&
                          Number(service.originalPrice) >
                            Number(service.price) && (
                            <Text style={styles.originalPriceText}>
                              ${Number(service.originalPrice).toFixed(0)}
                            </Text>
                          )}
                        <View style={styles.currentPriceRow}>
                          <DollarSign size={16} color="#10B981" />
                          <Text style={styles.price}>
                            ${(Number(service.price) || 0).toFixed(0)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  <View style={styles.statsRow}>
                    <Text style={styles.statText}>
                      {service._count.orders} orders
                    </Text>
                    <Text style={styles.statText}>
                      {service._count.reviews} reviews
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {services.length === 0 && (
          <View style={styles.emptyState}>
            <Briefcase size={48} color="#E2E8F0" />
            <H4 style={styles.emptyTitle}>No Services Yet</H4>
            <Text style={styles.emptyText}>
              Create your first service to get started.
            </Text>
            <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
              <Plus size={20} color="#FFF" />
              <Text style={styles.emptyButtonText}>Create Service</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Service Form Modal */}
        <Modal visible={showModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <H2>{editingService ? "Edit Service" : "New Service"}</H2>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalForm}>
                <Text style={styles.sectionTitle}>Service Name *</Text>
                <Text style={styles.label}>English</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nameEn}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nameEn: text })
                  }
                  placeholder="Service name (English)"
                />
                <Text style={styles.label}>Spanish</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nameEs}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nameEs: text })
                  }
                  placeholder="Nombre del servicio (Español)"
                />

                <Text style={styles.sectionTitle}>Category *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.category}
                  onChangeText={(text) =>
                    setFormData({ ...formData, category: text })
                  }
                  placeholder="e.g., TAX, IMMIGRATION, BUSINESS"
                />

                <Text style={styles.sectionTitle}>Pricing</Text>
                <Text style={styles.label}>Price *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.price.toString()}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: parseFloat(text) || 0 })
                  }
                  placeholder="0.00"
                  keyboardType="numeric"
                />

                <Text style={styles.label}>Original Price (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.originalPrice?.toString() || ""}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      originalPrice: parseFloat(text) || 0,
                    })
                  }
                  placeholder="0.00"
                  keyboardType="numeric"
                />

                <Text style={styles.sectionTitle}>Description *</Text>
                <Text style={styles.label}>English</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.descriptionEn}
                  onChangeText={(text) =>
                    setFormData({ ...formData, descriptionEn: text })
                  }
                  placeholder="Describe the service... (English)"
                  multiline
                  numberOfLines={4}
                />
                <Text style={styles.label}>Spanish</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.descriptionEs}
                  onChangeText={(text) =>
                    setFormData({ ...formData, descriptionEs: text })
                  }
                  placeholder="Describe el servicio... (Español)"
                  multiline
                  numberOfLines={4}
                />
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                >
                  <Text style={styles.saveButtonText}>
                    {editingService ? "Update" : "Create"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, serviceId: null })}
        onConfirm={confirmDelete}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={alertDialog.isOpen}
        onClose={() =>
          setAlertDialog({
            isOpen: false,
            title: "",
            message: "",
            variant: "info",
          })
        }
        title={alertDialog.title}
        message={alertDialog.message}
        variant={alertDialog.variant}
      />
    </Layout>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1, width: "100%" },
  container: {
    padding: 32,
    width: "100%",
    minWidth: "100%" as any,
    minHeight: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  containerMobile: { padding: 16, paddingTop: 24 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 200,
  },
  header: {
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    gap: 16,
    flexWrap: "wrap",
  },
  headerMobile: { flexDirection: "column", alignItems: "stretch" },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  headerActionsMobile: { width: "100%" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    height: 44,
    flex: 1,
    minWidth: 200,
  },
  searchBarMobile: { minWidth: 0, width: "100%" },
  searchInput: { flex: 1, fontSize: 16, color: "#0F172A", minWidth: 0 } as any,
  titleMobile: { fontSize: 24 },
  subtitle: { color: "#64748B", marginTop: 4 },
  errorText: { color: "#EF4444", fontSize: 14 },

  createButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#0F172A",
  },
  createButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },

  servicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    width: "100%",
  },
  servicesGridMobile: { gap: 12 },
  serviceCard: {
    flexBasis: "31%" as any,
    flexGrow: 0,
    flexShrink: 1,
    minWidth: 320,
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  } as any,
  serviceCardMobile: {
    flexBasis: "100%" as any,
    minWidth: 0,
    maxWidth: "100%" as any,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 0,
  },
  cardActions: { flexDirection: "row", gap: 8 },
  iconButton: { padding: 8, borderRadius: 0 },

  serviceName: { marginBottom: 8, fontSize: 18 },
  categoryBadge: {
    fontSize: 12,
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 12,
    fontWeight: "600",
  },
  description: {
    color: "#64748B",
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  priceContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  price: { fontSize: 20, fontWeight: "700", color: "#10B981" },
  timeContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  timeText: { fontSize: 12, color: "#64748B" },

  statsRow: { flexDirection: "row", gap: 16 },
  statText: { fontSize: 12, color: "#94A3B8" },

  emptyState: { padding: 64, alignItems: "center", gap: 16 },
  emptyTitle: { color: "#1E293B", marginTop: 16 },
  emptyText: { color: "#94A3B8", textAlign: "center" },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#0F172A",
    marginTop: 8,
    borderRadius: 0,
  },
  emptyButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },

  // Category
  categorySection: { marginBottom: 32, width: "100%" },
  categoryTitle: {
    marginBottom: 16,
    color: "#334155",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 8,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFF",
    width: "100%",
    maxWidth: 600,
    maxHeight: "90%",
    borderRadius: 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalForm: { padding: 24, maxHeight: 500 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  textArea: { minHeight: 100, textAlignVertical: "top", fontSize: 16 },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: { fontSize: 14, fontWeight: "600", color: "#64748B" },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  saveButtonText: { fontSize: 14, fontWeight: "600", color: "#FFF" },
  priceColumn: { gap: 2 },
  originalPriceText: {
    fontSize: 14,
    color: "#94A3B8",
    textDecorationLine: "line-through",
    fontWeight: "400",
    marginLeft: 20,
  },
  currentPriceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
});
