import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView, TextInput, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/actions/authActions';
import { loginSuccess } from '../store/actions/authActions';
import { api } from '../utils/api';

const Profile = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No hay token de acceso');
      }

      const userData = await api.get('/users/token');
      dispatch(loginSuccess(userData));
      setEditName(userData.nombre || '');
      setEditSurname(userData.apellido || '');
      setEditPhone(userData.telefono || '');
      setEditEmail(userData.email || '');
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      if (error.message === 'No hay token de acceso' || error.message.includes('401')) {
        // Si no hay token o el token es inválido, redirigir al login
        dispatch(logout());
        navigation.navigate('Login');
      } else {
        alert('Error al cargar los datos del usuario');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutPress = () => {
    setIsLogoutModalVisible(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('accessToken');
    dispatch(logout());
    navigation.navigate('Login');
    setIsLogoutModalVisible(false);
  };

  const handleLogoutCancel = () => {
    setIsLogoutModalVisible(false);
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(user?.nombre || '');
    setEditSurname(user?.apellido || '');
    setEditPhone(user?.telefono || '');
    setEditEmail(user?.email || '');
  };

  const handleSaveEdit = async () => {
    try {
      const updatedData = {
        nombre: editName,
        apellido: editSurname,
        telefono: editPhone,
        email: editEmail,
      };

      if (!user?.id) {
        throw new Error('ID de usuario no encontrado');
      }

      const response = await api.put(`/users/${user.id}`, updatedData);
      dispatch(loginSuccess(response));
      setIsEditing(false);
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      if (error.message === 'ID de usuario no encontrado') {
        alert('Error: No se pudo identificar al usuario');
      } else {
        alert('Error al actualizar los datos del usuario');
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Usuario</Text>
        <View style={styles.moreButton} />
      </View>

      {/* User Info */}
      <View style={styles.userInfoContainer}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://previews.123rf.com/images/asmati/asmati1610/asmati161000233/63831576-ilustraci%C3%B3n-de-signo-de-usuario-icono-blanco-en-c%C3%ADrculo-rojo.jpg' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{user ? `${user.nombre} ${user.apellido}` : 'Nombre de Usuario'}</Text>
        <View style={styles.contactInfo}>
          <Text>📞</Text>
          <Text>{user?.telefono || ''}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Text>✉️</Text>
          <Text>{user?.email || ''}</Text>
        </View>
      </View>

      {/* Edit User Information Section */}
      {isEditing && (
        <View style={styles.editSection}>
          <Text style={styles.editTitle}>Edite su información</Text>
          <View style={styles.editInputContainer}>
            <Text>📞</Text>
            <TextInput
              style={styles.editInput}
              placeholder="Teléfono"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.editInputContainer}>
            <Text>✉️</Text>
            <TextInput
              style={styles.editInput}
              placeholder="Email"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.editInputContainer}>
            <Text>👤</Text>
            <TextInput
              style={styles.editInput}
              placeholder="Nombre"
              value={editName}
              onChangeText={setEditName}
            />
          </View>
          <View style={styles.editInputContainer}>
            <Text>👤</Text>
            <TextInput
              style={styles.editInput}
              placeholder="Apellido"
              value={editSurname}
              onChangeText={setEditSurname}
            />
          </View>
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Logout Button */}
      {!isEditing && (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
          <Text>➡️</Text>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      )}

      {/* Options */}
      {!isEditing && (
        <View style={styles.optionsContainer}>
          <TouchableOpacity style={styles.optionItem}>
            <Text>📍</Text>
            <Text style={styles.optionText}>My Locations</Text>
            <Text>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text>🏷️</Text>
            <Text style={styles.optionText}>My Promotions</Text>
            <Text>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text>💳</Text>
            <Text style={styles.optionText}>Payment Methods</Text>
            <Text>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text>💬</Text>
            <Text style={styles.optionText}>Messages</Text>
            <Text>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text>🧑‍🤝‍🧑</Text>
            <Text style={styles.optionText}>Invite Friends</Text>
            <Text>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text>🛡️</Text>
            <Text style={styles.optionText}>Security</Text>
            <Text>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionItem}>
            <Text>{'❓'}</Text>
            <Text style={styles.optionText}>Help Center</Text>
            <Text>{'>'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Settings */}
      {!isEditing && (
        <View style={styles.settingsContainer}>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Language</Text>
            <TouchableOpacity style={styles.languageButton}>
              <Text>English</Text>
              <Text>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notification</Text>
          </View>
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
          </View>
        </View>
      )}

      {/* Logout Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLogoutModalVisible}
        onRequestClose={handleLogoutCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.modalCloseButton} onPress={handleLogoutCancel}>
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Cerrar Sesión</Text>
            <Text style={styles.modalMessage}>¿Seguro que quieres cerrar sesión?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={handleLogoutCancel}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={handleLogoutConfirm}>
                <Text style={styles.modalConfirmText}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      {/* ... */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 15,
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  moreButton: {
    width: 40, // Para alinear con el botón de retroceso
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    paddingBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#e91e63',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 18,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe0b2',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    justifyContent: 'center',
  },
  logoutButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d32f2f',
  },
  optionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  optionText: {
    marginLeft: 15,
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  settingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  editSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    padding: 15,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  editInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 10,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalCancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
  },
  modalConfirmButton: {
    backgroundColor: '#e91e63',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
});

export default Profile;